export interface MemberData {
  id: string;
  name: string;
  role: string;
  email: string;
  avatarSrc: string;
}

const DEFAULT_USER_AVATAR = "https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDI1LTExL3NyLWltYWdlLTA1MTEyNS1ubi0xNi1zLTY0MF8xLmpwZw.jpg";

export const MEMBERS: MemberData[] = [
  { id: "1", name: "Ana Cris", role: "Queijaria artesanal", email: "anacrisgomes2020@gmail.com", avatarSrc: DEFAULT_USER_AVATAR },
  { id: "2", name: "Juliana Rodrigues Santos", role: "Aroma terapia", email: "juljesus2015@gmail.com", avatarSrc: DEFAULT_USER_AVATAR },
  { id: "3", name: "Bianca Quirino Torres", role: "Espaço de Nutrição", email: "biaqtorres@yahoo.com.br", avatarSrc: DEFAULT_USER_AVATAR },
  { id: "4", name: "Fátima Regina dos Santos", role: "Wellness", email: "fatima.anthero@gmail.com", avatarSrc: DEFAULT_USER_AVATAR },
  { id: "5", name: "Jaqueline de Carvalho Dias", role: "Massoterapia", email: "jaquenicolas081@gmail.com", avatarSrc: DEFAULT_USER_AVATAR },
  { id: "6", name: "Isabela Cristina", role: "Consultoria financeira", email: "isabelacristina.consultoria@gmail.com", avatarSrc: DEFAULT_USER_AVATAR },
  { id: "7", name: "Andressa Rangel Palombo", role: "Moda Infantil", email: "anekids75@gmail.com", avatarSrc: DEFAULT_USER_AVATAR },
  { id: "8", name: "Marina Carmen", role: "MF Sabores (Culinária)", email: "marinafreitas626@gmail.com", avatarSrc: DEFAULT_USER_AVATAR },
  { id: "9", name: "Célia Aparecida Tomaz", role: "Café e Prosa / Buffet", email: "celiamartins371@gmail.com", avatarSrc: DEFAULT_USER_AVATAR },
  { id: "10", name: "Estefany Rabello", role: "Ateliê de decoração", email: "Estefanige01@gmail.com", avatarSrc: DEFAULT_USER_AVATAR },
  { id: "11", name: "Noemi Vitória", role: "Marketing", email: "rodriguesnoemi829@gmail.com", avatarSrc: DEFAULT_USER_AVATAR },
  { id: "12", name: "Danielle Lara Pinto", role: "Mentoria / Algodão Doce", email: "Daniellelarapinto90@hotmail.com", avatarSrc: DEFAULT_USER_AVATAR },
  { id: "13", name: "Andréa Aparecida de Carvalho", role: "Cozinha Italiana", email: "dedeyacarvalho49@gmail.com", avatarSrc: DEFAULT_USER_AVATAR },
  { id: "14", name: "Paola Rodrigues", role: "Gestão da Qualidade", email: "Elevare.consult@gmail.com", avatarSrc: DEFAULT_USER_AVATAR },
  { id: "15", name: "Silvana Natalina Ferreira Dias", role: "Tintas e Licitações", email: "silvanadiassdconsultoria@gmail.com", avatarSrc: DEFAULT_USER_AVATAR },
  { id: "16", name: "Angélica Lima", role: "Padaria", email: "padariadeliciarte@gmail.com", avatarSrc: DEFAULT_USER_AVATAR },
  { id: "17", name: "Sandra Goudard", role: "Fabricação de pizza", email: "sandragoudard2706@gmail.com", avatarSrc: DEFAULT_USER_AVATAR },
  { id: "18", name: "Lini Oliveria", role: "Moda / Sex Shop", email: "linioliveira123@gmail.com", avatarSrc: DEFAULT_USER_AVATAR },
  { id: "19", name: "Andreia de Oliveira Henriques", role: "Psicóloga", email: "andreiahenriquespsi@gmail.com", avatarSrc: DEFAULT_USER_AVATAR },
  { id: "20", name: "Sérgio Adriane da Silva", role: "Moda Fitness", email: "distribuidorajuizdefora.mg@gmail.com", avatarSrc: DEFAULT_USER_AVATAR }
];
