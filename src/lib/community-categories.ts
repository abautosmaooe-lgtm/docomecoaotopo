export interface Subcategory {
  id: string;
  label: string;
}

export interface CommunityCategory {
  id: string;
  label: string;
  icon: string;
  subcategories: Subcategory[];
}

export const COMMUNITY_CATEGORIES: CommunityCategory[] = [
  {
    id: "tecnologia",
    label: "Tecnologia e Inovação",
    icon: "💻",
    subcategories: [
      { id: "software", label: "Software (SaaS, Apps, Sistemas ERP)" },
      { id: "hardware", label: "Hardware, Computadores e Periféricos" },
      { id: "infraestrutura", label: "Infraestrutura de TI e Redes" },
      { id: "ciberseguranca", label: "Cibersegurança e Proteção de Dados" },
      { id: "ia", label: "Inteligência Artificial e Data Science" },
      { id: "web_cloud", label: "Desenvolvimento Web e Cloud Computing" },
    ],
  },
  {
    id: "design",
    label: "Design, Arte e Criação",
    icon: "🎨",
    subcategories: [
      { id: "grafico", label: "Design Gráfico e Identidade Visual" },
      { id: "produto", label: "Design de Produto e Industrial" },
      { id: "ui_ux", label: "UI/UX Design (Interfaces Digitais)" },
      { id: "animacao", label: "Animação, Modelagem 3D e Ilustração" },
      { id: "audiovisual", label: "Fotografia e Produção Audiovisual" },
      { id: "moda_estilismo", label: "Moda e Estilismo" },
    ],
  },
  {
    id: "marketing",
    label: "Marketing, Comunicação e Mídia",
    icon: "📣",
    subcategories: [
      { id: "digital", label: "Marketing Digital e Gestão de Tráfego" },
      { id: "publicidade", label: "Agências de Publicidade e Propaganda" },
      { id: "assessoria", label: "Assessoria de Imprensa e Relações Públicas" },
      { id: "copywriting", label: "Criação de Conteúdo e Copywriting" },
      { id: "influenciadores", label: "Influenciadores e Criação de Conteúdo Digital" },
      { id: "graficas", label: "Gráficas e Impressão Digital" },
    ],
  },
  {
    id: "industria",
    label: "Indústria, Produção e Manufatura",
    icon: "🏭",
    subcategories: [
      { id: "automotiva", label: "Automotiva e Autopeças" },
      { id: "textil", label: "Têxtil, Confecção e Calçados" },
      { id: "metalurgia", label: "Metalurgia, Siderurgia e Mecânica" },
      { id: "quimica", label: "Química, Plásticos e Borracha" },
      { id: "mobiliario", label: "Mobiliário e Marcenaria Industrial" },
      { id: "embalagens", label: "Embalagens e Descartáveis" },
    ],
  },
  {
    id: "financas",
    label: "Finanças, Seguros e Jurídico",
    icon: "💰",
    subcategories: [
      { id: "bancos", label: "Bancos, Fintechs e Meios de Pagamento" },
      { id: "contabilidade", label: "Contabilidade e Auditoria" },
      { id: "investimentos", label: "Investimentos, Corretoras e Criptoativos" },
      { id: "seguros", label: "Seguros (Automotivo, Vida, Residencial, Empresarial)" },
      { id: "advocacia", label: "Escritórios de Advocacia e Consultoria Jurídica" },
    ],
  },
  {
    id: "saude",
    label: "Saúde, Bem-Estar e Estética",
    icon: "🏥",
    subcategories: [
      { id: "hospitais", label: "Hospitais, Clínicas Médicas e Prontos-Socorros" },
      { id: "odontologia", label: "Odontologia e Clínicas Odontológicas" },
      { id: "psicologia", label: "Psicologia, Terapia e Saúde Mental" },
      { id: "farmacias", label: "Farmácias e Laboratórios de Análises" },
      { id: "estetica", label: "Estética, Salões de Beleza e Barbearias" },
      { id: "academias", label: "Academias, Studios de Pilates e Personal Trainers" },
    ],
  },
  {
    id: "logistica",
    label: "Logística, Transporte e Supply Chain",
    icon: "📦",
    subcategories: [
      { id: "transporte", label: "Transporte de Cargas e Fretes" },
      { id: "armazenagem", label: "Armazenagem, Galpões e Centros de Distribuição" },
      { id: "delivery", label: "Motoboys, Entregas Rápidas e Delivery" },
      { id: "passageiros", label: "Transporte de Passageiros" },
      { id: "comercio_exterior", label: "Comércio Exterior, Importação e Exportação" },
    ],
  },
  {
    id: "alimentacao",
    label: "Alimentação e Gastronomia",
    icon: "🍏",
    subcategories: [
      { id: "restaurantes", label: "Restaurantes (Pizzarias, Hamburguerias, etc.)" },
      { id: "bares", label: "Bares, Pubs e Distribuidoras de Bebidas" },
      { id: "cafeterias", label: "Cafeterias, Confeitarias e Padarias" },
      { id: "supermercados", label: "Supermercados, Minimercados e Mercearias" },
      { id: "suplementos", label: "Suplementos Alimentares e Produtos Naturais" },
      { id: "industria_alimenticia", label: "Indústria Alimentícia" },
    ],
  },
  {
    id: "eventos",
    label: "Eventos, Lazer e Entretenimento",
    icon: "🎉",
    subcategories: [
      { id: "organizacao", label: "Organização de Festas e Corporativos" },
      { id: "casas_shows", label: "Casas de Shows e Teatros" },
      { id: "locacao", label: "Locação de Equipamentos (Som, Luz, etc.)" },
      { id: "buffet", label: "Buffets e Serviços de Catering" },
      { id: "artistas", label: "Artistas, Bandas, Djs e Animadores" },
    ],
  },
  {
    id: "consultoria",
    label: "Consultoria, Assessoria e Negócios",
    icon: "👔",
    subcategories: [
      { id: "gestao", label: "Consultoria de Gestão Empresarial e RH" },
      { id: "rh", label: "Recrutamento, Seleção e Terceirização" },
      { id: "treinamentos", label: "Treinamentos, Coaching e Mentoria" },
      { id: "administrativo", label: "Tradução e Serviços Administrativos" },
    ],
  },
  {
    id: "imobiliario",
    label: "Imobiliário e Construção Civil",
    icon: "🏠",
    subcategories: [
      { id: "construtoras", label: "Construtoras, Empreiteiras e Engenharia" },
      { id: "imobiliarias", label: "Imobiliárias e Corretores de Imóveis" },
      { id: "arquitetura", label: "Arquitetura, Urbanismo e Design de Interiores" },
      { id: "materiais", label: "Lojas de Materiais de Construção" },
      { id: "manutencao", label: "Manutenção Residencial" },
    ],
  },
  {
    id: "varejo",
    label: "Varejo e Comércio Geral (Lojas)",
    icon: "🛒",
    subcategories: [
      { id: "vestuario", label: "Vestuário, Roupas e Acessórios" },
      { id: "eletronicos", label: "Eletrônicos e Eletrodomésticos" },
      { id: "cosmeticos", label: "Cosméticos e Perfumaria" },
      { id: "brinquedos", label: "Brinquedos e Artigos Infantis" },
      { id: "livrarias", label: "Livrarias, Papelarias e Armarinhos" },
      { id: "ecommerce", label: "E-commerce Geral / Marketplaces" },
    ],
  },
  {
    id: "educacao",
    label: "Educação, Treinamento e Idiomas",
    icon: "📚",
    subcategories: [
      { id: "escolas", label: "Escolas (Infantil, Fundamental e Médio)" },
      { id: "universidades", label: "Universidades e Faculdades" },
      { id: "tecnico", label: "Cursos Técnicos e Profissionalizantes" },
      { id: "idiomas", label: "Escolas de Idiomas" },
      { id: "online", label: "Plataformas de Cursos Online (EdTechs)" },
    ],
  },
  {
    id: "automotivo",
    label: "Automotivo e Veículos",
    icon: "🚗",
    subcategories: [
      { id: "concessionarias", label: "Concessionárias e Revendas de Usados" },
      { id: "oficinas", label: "Oficinas Mecânicas, Funilaria e Pintura" },
      { id: "lava_rapido", label: "Lava-Rápido e Estética Automotiva" },
      { id: "pecas", label: "Autocastros e Moto Peças" },
    ],
  },
  {
    id: "petshop",
    label: "Petshop e Veterinária",
    icon: "🐾",
    subcategories: [
      { id: "veterinaria", label: "Clínicas e Hospitais Veterinários" },
      { id: "pets_loja", label: "Petshops (Rações e Acessórios)" },
      { id: "banho_tosa", label: "Banho e Tosa / Hotel Pet" },
    ],
  },
  {
    id: "turismo",
    label: "Turismo e Hospitalidade",
    icon: "✈️",
    subcategories: [
      { id: "agencias_viagens", label: "Agências de Viagens e Intercâmbio" },
      { id: "hoteis", label: "Hotéis, Pousadas e Resorts" },
      { id: "guias", label: "Guias de Turismo e Aluguel de Veículos" },
    ],
  },
  {
    id: "agronegocio",
    label: "Agronegócio e Agropecuária",
    icon: "🚜",
    subcategories: [
      { id: "produtores", label: "Produtores Agrícolas e Cooperativas" },
      { id: "insumos", label: "Insumos, Fertilizantes e Defensivos" },
      { id: "maquinas", label: "Máquinas e Equipamentos Agrícolas" },
    ],
  },
  {
    id: "outras",
    label: "Outras",
    icon: "➕",
    subcategories: [
      { id: "outras_especificar", label: "Especificar Outra..." },
    ],
  },
];
