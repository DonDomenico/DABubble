export class Channel {
    channelName: string;
    channelDescription: string;
    // members?: string[];

    constructor(channelName: string, channelDescription: string) {
        this.channelName = channelName;
        this.channelDescription = channelDescription;
    }
}