import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Atualizando produtos existentes para ter 'fabricator' dentro de 'specs'
    const produtos = await strapi.db.query('api::produto.produto').findMany();

    let atualizados = 0;
    for (const prod of produtos) {
      const specs = prod.specs || {};
      if (!specs.fabricator) {
        specs.fabricator = 'TermoSinter Industrial';
        await strapi.db.query('api::produto.produto').update({
          where: { id: prod.id },
          data: { specs }
        });
        atualizados++;
      }
    }

    if (atualizados > 0) {
      console.log(`Atualizados ${atualizados} produtos com 'fabricator' no 'specs'...`);
    }

    // Verificando se já existem categorias para não duplicar na inicialização
    const categoriasCount = await strapi.db.query('api::categoria.categoria').count();

    if (categoriasCount === 0) {
      console.log('Criando dados de exemplo (categorias e produtos)...');

      const categoriasData = [
        { name: 'Válvulas' },
        { name: 'Tubos' },
        { name: 'Conexões' }
      ];

      const produtosData = {
        'Válvulas': [
          {
            name: 'Válvula Esfera Inox',
            code: 'VE-001',
            specs: { material: 'Inox 316', pressao: '1000 WOG', fabricator: 'ValvulaCorp' },
            applied: 'Sistemas de água e gás',
            price: '150,50 unidade'
          },
          {
            name: 'Válvula de Retenção',
            code: 'VR-002',
            specs: { material: 'Latão', tipo: 'Portinhola', fabricator: 'Metalurgica BR' },
            applied: 'Sistemas hidráulicos',
            price: '85,90 unidade'
          }
        ],
        'Tubos': [
          {
            name: 'Tubo de Cobre Flexível',
            code: 'TC-001',
            specs: { diametro: '1/2 polegada', comprimento: '15m', fabricator: 'CobreTec' },
            applied: 'Ar condicionado e refrigeração',
            price: '320,00 metro'
          },
          {
            name: 'Tubo PVC Soldável',
            code: 'TP-002',
            specs: { diametro: '25mm', comprimento: '6m', fabricator: 'TuboPlast' },
            applied: 'Água fria',
            price: '45,00 metro'
          }
        ],
        'Conexões': [
          {
            name: 'Cotovelo 90º Galvanizado',
            code: 'C90-001',
            specs: { material: 'Aço Galvanizado', diametro: '1 polegada', fabricator: 'TermoSinter Industrial' },
            applied: 'Instalações de incêndio',
            price: '12,50 lote'
          },
          {
            name: 'Tee de Redução Cobre',
            code: 'TR-002',
            specs: { material: 'Cobre', medidas: '22x15x22mm', fabricator: 'TermoSinter Industrial' },
            applied: 'Aquecimento solar',
            price: '18,30 pacote'
          }
        ]
      };

      for (const catData of categoriasData) {
        // Criando a categoria e publicando (publishedAt)
        const categoria = await strapi.entityService.create('api::categoria.categoria', {
          data: {
            ...catData,
            publishedAt: new Date()
          }
        });

        // Criando os produtos para essa categoria e publicando
        const produtos = produtosData[catData.name as keyof typeof produtosData];
        for (const prodData of produtos) {
          await strapi.entityService.create('api::produto.produto', {
            data: {
              ...prodData,
              category: categoria.id,
              publishedAt: new Date()
            }
          });
        }
      }

      console.log('Dados de exemplo criados com sucesso!');
    }
  },
};
