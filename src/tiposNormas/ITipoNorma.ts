export default interface ITipoNorma {
    local?: string;
    autoridade: Autoridade;
    tipo: string;
    sigla: string;
    semNumero?: boolean;
}

export enum Autoridade {
    FEDERAL = 'federal',
    ESTADUAL = 'estadual',
    MUNICIPAL = 'municipal'
}
