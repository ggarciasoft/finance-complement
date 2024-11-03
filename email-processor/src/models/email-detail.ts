export class MessageBody {
    data?: string | null;
}

export class MessagePart {
    body?: MessageBody;
    mimeType?: string | null;
    parts?: MessagePart[];
}

export class EmailDetail {
    from?: string;
    title?: string;
    payload: MessagePart | undefined;
}
