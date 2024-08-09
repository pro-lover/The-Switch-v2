import { Injectable } from '@angular/core';
import { AlertService } from '@app/core/services';
import { environment } from '@env/environment';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
//import { map, finalize } from 'rxjs/operators';

export class Message {
	constructor(
		public sender: string,
		public content: string,
		public channel: string,
		public model: string,
		public action: string,
		public modelId: string,
		public isBroadcast = false,
	) { }
}

@Injectable({ providedIn: 'root' })
export class WebSocketService {

	public clientMessage = '';
	public isBroadcast = false;
	public sender = '';
	public serverMessages = new Array<Message>();
	private socket$: WebSocketSubject<any> = webSocket(`${environment.wsUrl}`);

	constructor(
		private alertService: AlertService
	) {

		this.socket$
			.subscribe({
				next: (msg) => {
					//console.log('CMDBNR.IO - message received:',  msg);
					//this.serverMessages.push(msg);
					this.alertService.info(msg.content, { keepAfterRouteChange: true });
				},
				error: error => {
					//console.log(error)
				}
			});
	}

	public get getMessagesFromServer(): Message[] {
		return this.serverMessages;
	}

	public toggleIsBroadcast(): void {
		this.isBroadcast = !this.isBroadcast;
	}

	public sendMessage(data: any): void {

		const message = new Message(
			data.sender,
			data.content,
			data.channel,
			data.model,
			data.action,
			data.modelId,
			data.isBroadcast
		);

		this.socket$.next(message);
	}

}
