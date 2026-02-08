export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    const message = `Firestore Permission Denied: You do not have permission to ${context.operation} the document at '${context.path}'.`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;
  }

  toContextObject() {
    return {
      message: this.message,
      ...this.context,
    };
  }
}
