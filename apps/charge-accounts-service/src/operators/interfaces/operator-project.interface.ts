export interface OperatorProject {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  publicKey: string;
  sandboxKey: string;
  secretPrefix: string;
  secretLastFourChars: string;
  sponsorId: string;
  secretKey?: string;
}
