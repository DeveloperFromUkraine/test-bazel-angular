
export interface GraphQLErrorResponse {
  id: string;
  status: number;
  syntaxError?: string;
  messages: {
    status: number;
    message: string;
  }[];
}

export function graphQLError(...messages: string[]): GraphQLErrorResponse {
  return {
    id: '123',
    status: 400,
    messages: messages.map(message => ({
      status: 400,
      message,
    })),
  };
}

export function graphQLSyntaxError(syntaxError: string): GraphQLErrorResponse {
  return {
    id: 'abc',
    status: 400,
    messages: [],
    syntaxError,
  };
}
