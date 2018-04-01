interface Number {
  pad(size): string;
}

interface Date {
  format(formatString: string): string
  toUTCDate(): string
  addDays(days: number): Date
}

interface String {
  format(...args: any[]): string
  startsWith(str: string): boolean
  endsWith(str: string): boolean
  trimStart(str: string): string
}
