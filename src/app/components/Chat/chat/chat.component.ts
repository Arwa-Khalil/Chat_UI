// ChatComponent: UI for chat, sends questions via ChatService, sanitizes markdown -> HTML and keeps scroll to bottom
import { Component, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../services/chat.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { trigger, transition, style, animate } from '@angular/animations';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  animations: [
    trigger('slideFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-12px)' }),
        animate('260ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class ChatComponent implements AfterViewChecked {
  question = '';
  messages: { role: 'user' | 'assistant'; text: string; safe?: SafeHtml }[] = [];
  loading = false;

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef<HTMLDivElement>;

  constructor(private chat: ChatService, private sanitizer: DomSanitizer) {}

  sendQuestion() {
    const q = (this.question || '').trim();
    if (!q) return;

    this.messages.push({ role: 'user', text: q });
    this.question = '';
    this.loading = true;
    this.scrollToBottom();

    this.chat.askQuestion(q).pipe(
      finalize(() => { this.loading = false; })
    ).subscribe({
      next: res => {
        const answerText = (res && (res as any).answer) ? (res as any).answer : String(res);
        const html = this.markdownToHtml(answerText);
        this.messages.push({ role: 'assistant', text: answerText, safe: this.sanitizer.bypassSecurityTrustHtml(html) });
        setTimeout(() => this.scrollToBottom(), 80);
      },
      error: () => {
        const err = 'Error: failed to get answer from server.';
        this.messages.push({ role: 'assistant', text: err, safe: this.sanitizer.bypassSecurityTrustHtml(`<p>${err}</p>`) });
        setTimeout(() => this.scrollToBottom(), 80);
      }
    });
  }

  ngAfterViewChecked() { /* no-op, scroll handled elsewhere */ }

  private scrollToBottom() {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (!el) return;
      setTimeout(() => { el.scrollTop = el.scrollHeight; }, 30);
    } catch {}
  }

  // lightweight markdown -> HTML (headings, lists, blockquote, fenced code, inline code, links, bold/italic)
  private markdownToHtml(md: string): string {
    if (!md) return '';

    const esc = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    md = md.replace(/```(\w+)?\n([\s\S]*?)```/g, (_m, lang, code) => {
      const attr = lang ? ` data-lang="${esc(lang)}"` : '';
      return `<pre class="code-block"${attr}><code>${esc(code)}</code></pre>`;
    });

    // links
    md = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, t, u) => `<a href="${u}" target="_blank" rel="noopener noreferrer">${esc(t)}</a>`);

    // bold/italic
    md = md.replace(/\*\*\*([\s\S]+?)\*\*\*/g,'<strong><em>$1</em></strong>');
    md = md.replace(/\*\*([\s\S]+?)\*\*/g,'<strong>$1</strong>');
    md = md.replace(/\*([\s\S]+?)\*/g,'<em>$1</em>');
    md = md.replace(/`([^`]+)`/g, (_m, c) => `<code>${esc(c)}</code>`);

    const lines = md.split(/\r?\n/);
    const out: string[] = [];
    let inList: 'ul'|'ol'|null = null;

    for (let raw of lines) {
      const line = raw.trim();
      if (!line) { if (inList) { out.push(inList === 'ul' ? '</ul>' : '</ol>'); inList = null; } continue; }

      if (/^#{3}\s+/.test(line)) { if (inList){out.push(`</${inList}>`); inList=null;} out.push(`<h3>${esc(line.replace(/^#{3}\s+/,''))}</h3>`); continue; }
      if (/^#{2}\s+/.test(line)) { if (inList){out.push(`</${inList}>`); inList=null;} out.push(`<h2>${esc(line.replace(/^#{2}\s+/,''))}</h2>`); continue; }
      if (/^#\s+/.test(line))      { if (inList){out.push(`</${inList}>`); inList=null;} out.push(`<h1>${esc(line.replace(/^#\s+/,''))}</h1>`); continue; }

      if (/^>\s+/.test(line)) { out.push(`<blockquote>${esc(line.replace(/^>\s+/,''))}</blockquote>`); continue; }

      if (/^[-*]\s+/.test(line)) {
        if (inList !== 'ul') { if (inList) out.push(`</${inList}>`); out.push('<ul>'); inList = 'ul'; }
        out.push(`<li>${esc(line.replace(/^[-*]\s+/,''))}</li>`);
        continue;
      }

      if (/^\d+\.\s+/.test(line)) {
        if (inList !== 'ol') { if (inList) out.push(`</${inList}>`); out.push('<ol>'); inList = 'ol'; }
        out.push(`<li>${esc(line.replace(/^\d+\.\s+/,''))}</li>`);
        continue;
      }

      if (/^<pre class="code-block">/.test(line) || /^<\/pre>/.test(line) || /^<pre/.test(line)) { out.push(line); continue; }

      out.push(`<p>${esc(line)}</p>`);
    }

    if (inList) out.push(`</${inList}>`);
    return out.join('\n');
  }
}
