import { ISequencia } from './InterpretadorMultiplo';

export interface INo<T> {
    proximaLetra: ISequencia<T>;
    item?: T;
}
