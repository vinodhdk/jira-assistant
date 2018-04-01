import { Injectable } from '@angular/core';
import { Message } from 'primeng/components/common/api';
import { MessageService as PrimeMessageService } from 'primeng/components/common/messageservice';

@Injectable()
export class MessageService {

  constructor(private messageService: PrimeMessageService) { }

  warning(message: string, title?: string) {
    var msg: Message = { summary: title, detail: message, severity: "warn" };
    this.messageService.add(msg);
  }

  error(message: string, title?: string) {
    var msg: Message = { summary: title, detail: message, severity: "error" };
    this.messageService.add(msg);
  }

  success(message: string, title?: string) {
    var msg: Message = { summary: title, detail: message, severity: "success" };
    this.messageService.add(msg);
  }

  info(message: string, title?: string) {
    var msg: Message = { summary: title, detail: message, severity: "info" };
    this.messageService.add(msg);
  }
}
