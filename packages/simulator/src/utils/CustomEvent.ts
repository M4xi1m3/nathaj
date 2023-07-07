export class CustomEvent<T> extends Event {
    public detail: T;

    constructor(message, data: { detail: T } & EventInit) {
        super(message, data);
        this.detail = data.detail;
    }
}
