import {default as STATE_CODES} from './states.json';
import { plainToClass } from 'class-transformer';
export class StateCode {
  id: number;
  code: string;
  name: string;
}

export const stateCodes: Array<StateCode> = plainToClass(StateCode, STATE_CODES);
