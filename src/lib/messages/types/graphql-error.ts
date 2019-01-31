/**
 * Represents a response from the GraphQL server.
 */
export interface GraphQLErrorResponse {
  /**
   * A unique ID to correlate the error response.
   */
  id: string;

  /**
   * The overall HTTP status code for the response.
   */
  status: number;

  /**
   * GraphQL will not make backend end service calls if there is a syntax issue with queries or mutations.
   * This field captures those errors.
   */
  syntaxError?: string;

  /**
   * An array of messages returned from the backend.
   */
  messages: {
    /**
     * The HTTP status code for this specific response.
     */
    status: number;

    /**
     * The message text.
     */
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
