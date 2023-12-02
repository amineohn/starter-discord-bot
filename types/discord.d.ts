export type Interaction = {
    type: InteractionType;
    data: {
        name: string;
    };
    member: {
        user: {
            username: string;
            id: string;
        };
    };
}
