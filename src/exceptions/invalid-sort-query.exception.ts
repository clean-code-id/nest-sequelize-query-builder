import { BadRequestException } from '@nestjs/common';

export class InvalidSortQueryException extends BadRequestException {
  constructor(unknownSorts: string[], allowedSorts: string[]) {
    const message = `Requested sort(s) '${unknownSorts.join(', ')}' are not allowed. Allowed sort(s) are: ${allowedSorts.join(', ')}`;
    super(message);
  }
}
