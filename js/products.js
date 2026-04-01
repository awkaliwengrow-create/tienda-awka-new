// ===========================================
// AWKA LIWEN - BASE DE DATOS DE PRODUCTOS
// ===========================================
// Acá editás precios, agregás fotos y marcás destacados/ofertas

const products = [
    // ==========================================
    // FERTILIZANTES/NUTRIENTES
    // ==========================================
    
    // TREE MIX
    {
        id: 1,
        name: 'Tree Mix N',
        category: 'fertilizantes',
        brand: 'Tree Mix',
        image: 'img/productos/treemix-n.jpg',
        sizes: [
            {size: '200ml', price: 10500}, // ← Cambiar precios reales
            {size: '45ml', price: 4900}
        ],
        description: 'Fertilizante nitrogenado para crecimiento',
        featured: true, // ← true si querés que aparezca en destacados
        offer: false    // ← true si está en oferta
        
    },
    {
        id: 2,
        name: 'Tree Mix F',
        category: 'fertilizantes',
        brand: 'Tree Mix',
        image: 'img/productos/treemix-f.jpg',
        sizes: [
            {size: '500ml', price: 22500},
            {size: '200ml', price: 11000},
            {size: '45ml', price: 4500}
        ],
        description: 'Fertilizante para floración',
        featured: false,
        offer: false
    },
    {
        id: 3,
        name: 'Tree Mix Candy',
        category: 'fertilizantes',
        brand: 'Tree Mix',
        image: 'img/productos/treemix-candy.jpg',
        sizes: [
            {size: '500ml', price: 31600},
            {size: '200ml', price: 9000},
            {size: '45ml', price: 4500}
        ],
        description: 'Potenciador de aroma y sabor',
        featured: true,
        offer: false
    },
    {
        id: 4,
        name: 'Tree Mix Pro',
        category: 'fertilizantes',
        brand: 'Tree Mix',
        image: 'img/productos/treemix-pro.jpg',
        sizes: [
            {size: '200ml', price: 15000},
            {size: '45ml', price: 5500}
        ],
        description: 'Estimulador profesional',
        featured: false,
        offer: false
    },
    {
        id: 5,
        name: 'Tree Mix Mico',
        category: 'fertilizantes',
        brand: 'Tree Mix',
        image: 'img/productos/treemix-mico.jpg',
        sizes: [
            {size: '200ml', price: 13000},
            {size: '45ml', price: 7000}
        ],
        description: 'Micorrizas beneficiosas',
        featured: false,
        offer: false
    },
    {
        id: 6,
        name: 'Tree Mix A',
        category: 'fertilizantes',
        brand: 'Tree Mix',
        image: 'img/productos/treemix-a.jpg',
        sizes: [
            {size: '200ml', price: 11000},
            {size: '45ml', price: 4500}
        ],
        description: 'Nutriente base parte A',
        featured: false,
        offer: false
    },
    {
        id: 7,
        name: 'Kill Mix',
        category: 'fertilizantes',
        brand: 'Tree Mix',
        image: 'img/productos/treemix-kill.jpg',
        sizes: [
            {size: '200ml', price: 21000},
            {size: '45ml', price: 6000}
        ],
        description: 'Control preventivo',
        featured: false,
        offer: false
    },
    {
        id: 8,
        name: 'Zym',
        category: 'fertilizantes',
        brand: 'Tree Mix',
        image: 'img/productos/treemix-zym.jpg',
        sizes: [
            {size: '200ml', price: 23000},
            {size: '45ml', price: 8000}
        ],
        description: 'Complejo enzimático',
        featured: false,
        offer: false
    },
    {
        id: 9,
        name: 'Biocann',
        category: 'fertilizantes',
        brand: 'Tree Mix',
        image: 'img/productos/treemix-biocann.jpg',
        sizes: [
            {size: '500ml', price: 36500},
            {size: '200ml', price: 16000},
            {size: '45ml', price: 3200}
        ],
        description: 'Estimulador biológico',
        featured: false,
        offer: false
    },
    
    // MANTRA
    {
        id: 10,
        name: 'Dynamite 2.0',
        category: 'fertilizantes',
        brand: 'Mantra',
        image: 'img/productos/mantra-dynamite.jpg',
        sizes: [{size: '200ml', price: 13600}],
        description: 'Potenciador de floración',
        featured: true,
        offer: false
    },
    {
        id: 11,
        name: 'Dynamite 2.0 Orgánico',
        category: 'fertilizantes',
        brand: 'Mantra',
        image: 'img/productos/mantra-dynamite-organic.jpg',
        sizes: [{size: '200ml', price: 13600}],
        description: 'Potenciador orgánico',
        featured: false,
        offer: false
    },
    {
        id: 12,
        name: 'Nitro Monstruoso',
        category: 'fertilizantes',
        brand: 'Mantra',
        image: 'img/productos/mantra-nitro-monstruoso.jpg',
        sizes: [{size: '200ml', price: 13600}],
        description: 'Booster de nitrógeno',
        featured: false,
        offer: false
    },
    {
        id: 13,
        name: 'Nitro Monstruoso Orgánico',
        category: 'fertilizantes',
        brand: 'Mantra',
        image: 'img/productos/mantra-nitro-organico.jpg',
        sizes: [{size: '200ml', price: 13600}],
        description: 'Nitrógeno orgánico',
        featured: false,
        offer: false
    },
    {
        id: 14,
        name: 'Sugar Candy',
        category: 'fertilizantes',
        brand: 'Mantra',
        image: 'img/productos/mantra-sugar-candy.jpg',
        sizes: [{size: '200ml', price: 13600}],
        description: 'Mejorador de sabor y aroma',
        featured: false,
        offer: false
    },
    {
        id: 15,
        name: 'Algafishum Nodosum',
        category: 'fertilizantes',
        brand: 'Mantra',
        image: 'img/productos/mantra-algafishum.jpg',
        sizes: [{size: '200ml', price: 15200}],
        description: 'Extracto de algas',
        featured: false,
        offer: false
    },
    {
        id: 16,
        name: 'pH- Mantra',
        category: 'fertilizantes',
        brand: 'Mantra',
        image: 'img/productos/mantra-ph-.jpg',
        sizes: [{size: '200ml', price: 10800}],
        description: 'Regulador de pH down',
        featured: false,
        offer: false
    },
    {
        id: 17,
        name: 'Flor de Auto',
        category: 'fertilizantes',
        brand: 'Mantra',
        image: 'img/productos/mantra-flor-de-auto.jpg',
        sizes: [{size: '200ml', price: 10800}],
        description: 'Especial autoflorecientes',
        featured: false,
        offer: false
    },
    {
        id: 18,
        name: 'Toque Final',
        category: 'fertilizantes',
        brand: 'Mantra',
        image: 'img/productos/mantra-toque-final.jpg',
        sizes: [{size: '200ml', price: 10800}],
        description: 'Limpiador final',
        featured: false,
        offer: false
    },
    {
        id: 19,
        name: 'Leche de Hueso',
        category: 'fertilizantes',
        brand: 'Mantra',
        image: 'img/productos/mantra-leche-de-hueso.jpg',
        sizes: [{size: '200ml', price: 10800}],
        description: 'Fósforo y calcio',
        featured: false,
        offer: false
    },
    
    // NAMASTE
    {
        id: 20,
        name: 'Amazonia',
        category: 'fertilizantes',
        brand: 'Namaste',
        image: 'img/productos/namaste-amazonia.jpg',
        sizes: [
            {size: '300gr', price: 28000},
            {size: '150gr', price: 15000}
        ],
        description: 'Fertilizante orgánico completo',
        featured: true,
        offer: false
    },
    {
        id: 21,
        name: 'Oro Negro',
        category: 'fertilizantes',
        brand: 'Namaste',
        image: 'img/productos/namaste-oro-negro.jpg',
        sizes: [
            {size: '2lts', price: 5500},
            {size: '500ml', price: 16000},
            {size: '100ml', price: 39000}
        ],
        description: 'Húmicos y fúlvicos',
        featured: false,
        offer: false
    },
    {
        id: 22,
        name: 'Flora Booster',
        category: 'fertilizantes',
        brand: 'Namaste',
        image: 'img/productos/namaste-flora-booster.jpg',
        sizes: [
            {size: '500ml', price: 16000},
            {size: '100ml', price: 5500}
        ],
        description: 'Potenciador de flores',
        featured: false,
        offer: false
    },
    {
        id: 23,
        name: 'Trico+',
        category: 'fertilizantes',
        brand: 'Namaste',
        image: 'img/productos/namaste-trico+.jpg',
        sizes: [
            {size: '250gr', price: 13000},
            {size: '150gr', price: 7000}
        ],
        description: 'Trichoderma beneficioso',
        featured: false,
        offer: false
    },
    {
        id: 25,
        name: 'pH- Namaste',
        category: 'fertilizantes',
        brand: 'Namaste',
        image: 'img/productos/namaste-ph-.jpg',
        sizes: [
            {size: '500ml', price: 15000},
            {size: '100ml', price: 5000}
        ],
        description: 'Regulador pH down',
        featured: false,
        offer: false
    },
    {
        id: 26,
        name: 'Clonaste',
        category: 'fertilizantes',
        brand: 'Namaste',
        image: 'img/productos/namaste-clonaste.jpg',
        sizes: [{size: '30cc', price: 12000}],
        description: 'Enraizante para clones',
        featured: false,
        offer: false
    },
    {
        id: 27,
        name: 'Bio Protect',
        category: 'fertilizantes',
        brand: 'Namaste',
        image: 'img/productos/namaste-bio-protect.jpg',
        sizes: [{size: '100ml', price: 10000}],
        description: 'Protector biológico',
        featured: false,
        offer: false
    },
    
    // TOP CROP
    {
        id: 28,
        name: 'Top Veg',
        category: 'fertilizantes',
        brand: 'Top Crop',
        image: 'img/productos/topcrop-top-veg.jpg',
        sizes: [
            {size: '1lts', price: 24000},
            {size: '250ml', price: 8200}
        ],
        description: 'Nutriente crecimiento vegetal',
        featured: true,
        offer: false
    },
    {
        id: 29,
        name: 'Top Bloom',
        category: 'fertilizantes',
        brand: 'Top Crop',
        image: 'img/productos/topcrop-top-bloom.jpg',
        sizes: [
            {size: '1lts', price: 20000},
            {size: '250ml', price: 8200}
        ],
        description: 'Nutriente floración',
        featured: true,
        offer: false
    },
    {
        id: 30,
        name: 'Top Deeper',
        category: 'fertilizantes',
        brand: 'Top Crop',
        image: 'img/productos/topcrop-deeper.jpg',
        sizes: [
            {size: '250ml', price: 11000},
            {size: '100ml', price: 5500}
        ],
        description: 'Estimulador radicular',
        featured: false,
        offer: false
    },
    {
        id: 31,
        name: 'Top Barrier',
        category: 'fertilizantes',
        brand: 'Top Crop',
        image: 'img/productos/topcrop-top-barrier.jpg',
        sizes: [{size: '100ml', price: 5500}],
        description: 'Protector natural',
        featured: false,
        offer: false
    },
    {
        id: 32,
        name: 'Top Candy',
        category: 'fertilizantes',
        brand: 'Top Crop',
        image: 'img/productos/topcrop-top-candy.jpg',
        sizes: [{size: '250ml', price: 9000}],
        description: 'Potenciador de terpenos',
        featured: false,
        offer: false
    },
    {
        id: 33,
        name: 'Top Auto',
        category: 'fertilizantes',
        brand: 'Top Crop',
        image: 'img/productos/topcrop-top-auto.jpg',
        sizes: [{size: '250ml', price: 11500}],
        description: 'Especial autoflorecientes',
        featured: false,
        offer: false
    },
    {
        id: 34,
        name: 'Top Bud',
        category: 'fertilizantes',
        brand: 'Top Crop',
        image: 'img/productos/topcrop-top-bud.jpg',
        sizes: [{size: '100ml', price: 18000}],
        description: 'Engordador de cogollos',
        featured: false,
        offer: false
    },
    {
        id: 35,
        name: 'Big One',
        category: 'fertilizantes',
        brand: 'Top Crop',
        image: 'img/productos/topcrop-big-one.jpg',
        sizes: [{size: '100ml', price: 13500}],
        description: 'Potenciador PK',
        featured: false,
        offer: false
    },
    // KAWSAY
{
        id: 100,
        name: 'veg',
        category: 'fertilizantes',
        brand: 'kawsay',
        image: 'img/productos/kawsay-vege.jpg',
        sizes: [{size: '200ml', price: 17500}],
        description: 'kawsay',
        featured: false,
        offer: false
    },
{
        id: 101,
        name: 'Bloom',
        category: 'fertilizantes',
        brand: 'kawsay',
        image: 'img/productos/kawsay-bloom.jpg',
        sizes: [{size: '200ml', price: 17500}],
        description: 'kawsay bloom',
        featured: false,
        offer: false
    },
    {
        id: 102,
        name: 'base a',
        category: 'fertilizantes',
        brand: 'kawsay',
        image: 'img/productos/kawsay-base-a.jpg',
        sizes: [{size: '200ml', price: 17500}],
        description: 'kawsay base a',
        featured: false,
        offer: false
    },
    {
        id: 103,
        name: 'base b',
        category: 'fertilizantes',
        brand: 'kawsay',
        image: 'img/productos/kawsay-base-b.jpg',
        sizes: [{size: '200ml', price: 17500}],
        description: 'kawsay base b',
        featured: false,
        offer: false
    },
    {
        id: 104,
        name: 'combo ph',
        category: 'sales',
        brand: 'kawsay',
        image: 'img/productos/kawsay-ph.jpg',
        sizes: [{size: '30ml', price: 17800}],
        description: 'kawsay combo ph',
        featured: false,
        offer: false
    },
    // ==========================================
    // PLAGUICIDAS/INSECTICIDAS
    // ==========================================
    
    // MAMBORETA
    {
        id: 36,
        name: 'Mamboreta Z',
        category: 'plaguicidas',
        brand: 'Mamboreta',
        image: 'img/productos/mamboreta-z.jpg',
        sizes: [{size: '30cc', price: 9700}],
        description: 'Control de plagas',
        featured: false,
        offer: false
    },
    {
        id: 37,
        name: 'Mamboreta D',
        category: 'plaguicidas',
        brand: 'Mamboreta',
        image: 'img/productos/mamboreta-d.jpg',
        sizes: [{size: '30cc', price: 8500}],
        description: 'Insecticida natural',
        featured: false,
        offer: false
    },
    {
        id: 38,
        name: 'Hervicida G',
        category: 'plaguicidas',
        brand: 'Mamboreta',
        image: 'img/productos/mamboreta-g.jpg',
        sizes: [{size: '100cc', price: 11000}],
        description: 'Herbicida selectivo',
        featured: false,
        offer: false
    },
    {
        id: 39,
        name: 'Bolita',
        category: 'plaguicidas',
        brand: 'Mamboreta',
        image: 'img/productos/mamboreta-bolita.jpg',
        sizes: [{size: '100gr', price: 10200}],
        description: 'Cebo granulado',
        featured: false,
        offer: false
    },
    {
        id: 40,
        name: 'Mamboreta M',
        category: 'plaguicidas',
        brand: 'Mamboreta',
        image: 'img/productos/mamboreta-m.jpg',
        sizes: [
            {size: '250cc', price: 9200},
            {size: '100cc', price: 14500}
        ],
        description: 'Multi plagas',
        featured: false,
        offer: false
    },
    {
        id: 41,
        name: 'Foli',
        category: 'plaguicidas',
        brand: 'Mamboreta',
        image: 'img/productos/mamboreta-foli.jpg',
        sizes: [{size: '30cc', price: 19500}],
        description: 'Foliar protector',
        featured: false,
        offer: false
    },
    {
        id: 42,
        name: 'Aba',
        category: 'plaguicidas',
        brand: 'Mamboreta',
        image: 'img/productos/mamboreta-aba.jpg',
        sizes: [{size: '30cc', price: 13500}],
        description: 'Control específico',
        featured: false,
        offer: false
    },
    {
        id: 43,
        name: 'B+R',
        category: 'plaguicidas',
        brand: 'Mamboreta',
        image: 'img/productos/mamboreta-b+r.jpg',
        sizes: [
            {size: '200gr', price: 13000},
            {size: '100gr', price: 8000}
        ],
        description: 'Bichos bolita y roedores',
        featured: false,
        offer: false
    },
    {
        id: 44,
        name: 'Mamboreta H',
        category: 'plaguicidas',
        brand: 'Mamboreta',
        image: 'img/productos/mamboreta-h.jpg',
        sizes: [{size: '30cc', price: 8000}],
        description: 'Hongos preventivo',
        featured: false,
        offer: false
    },
    {
        id: 45,
        name: 'Oil 85',
        category: 'plaguicidas',
        brand: 'Mamboreta',
        image: 'img/productos/mamboreta-oil-85.jpg',
        sizes: [{size: '100cc', price: 9600}],
        description: 'Aceite mineral',
        featured: false,
        offer: false
    },
    {
        id: 46,
        name: 'Confi',
        category: 'plaguicidas',
        brand: 'Mamboreta',
        image: 'img/productos/mamboreta-confi.jpg',
        sizes: [{size: '30cc', price: 15200}],
        description: 'Confidor natural',
        featured: false,
        offer: false
    },
    {
        id: 47,
        name: 'Mamboreta K',
        category: 'plaguicidas',
        brand: 'Mamboreta',
        image: 'img/productos/mamboreta-k.jpg',
        sizes: [{size: '30cc', price: 18200}],
        description: 'Insecticida contacto',
        featured: false,
        offer: false
    },
    {
        id: 48,
        name: 'Kaput',
        category: 'plaguicidas',
        brand: 'Mamboreta',
        image: 'img/productos/mamboreta-kaput.jpg',
        sizes: [
            {size: '100ml', price: 5500},
            {size: '60ml', price: 3800}
        ],
        description: 'Exterminador rápido',
        featured: false,
        offer: false
    },
    {
        id: 49,
        name: 'Mirex Hormiguicida',
        category: 'plaguicidas',
        brand: 'Mamboreta',
        image: 'img/productos/mamboreta-mirex.jpg',
        sizes: [
            {size: '200gr', price: 4500},
            {size: '100gr', price: 2800}
        ],
        description: 'Elimina hormigas',
        featured: false,
        offer: false
    },
    {
        id: 50,
        name: 'Grillo',
        category: 'plaguicidas',
        brand: 'Mamboreta',
        image: 'img/productos/mamboreta-grillo.jpg',
        sizes: [{size: '200gr', price: 16000}],
        description: 'Cebo para grillos',
        featured: false,
        offer: false
    },
    {
        id: 51,
        name: 'A Trapa',
        category: 'plaguicidas',
        brand: 'Mamboreta',
        image: 'img/productos/mamboreta-a-trap.jpg',
        sizes: [{size: '30cc', price: 10000}],
        description: 'Atrapa insectos',
        featured: false,
        offer: false
    },
    {
        id: 52,
        name: 'Hormiga Cortadora Cebo',
        category: 'plaguicidas',
        brand: 'Mamboreta',
        image: 'img/productos/eco-mambo-cebo.jpg',
        sizes: [{size: '1u', price: 2800}],
        description: 'Cebo especial cortadoras',
        featured: false,
        offer: false
    },
    
    // ECO MAMBO
    {
        id: 53,
        name: 'Jabón Potásico Neem Canela',
        category: 'plaguicidas',
        brand: 'Eco Mambo',
        image: 'img/productos/eco-mambo-jabon.jpg',
        sizes: [
            {size: '500ml', price: 26500},
            {size: '250ml', price: 14000},
            {size: '100ml', price: 8200}
        ],
        description: 'Limpieza y protección',
        featured: true,
        offer: false
    },
    {
        id: 54,
        name: 'Paraiso',
        category: 'plaguicidas',
        brand: 'Eco Mambo',
        image: 'img/productos/eco-mambo-paraiso.jpg',
        sizes: [{size: '100ml', price: 6500}],
        description: 'Extracto de paraíso',
        featured: false,
        offer: false
    },
    {
        id: 55,
        name: 'Trichoderma',
        category: 'plaguicidas',
        brand: 'Eco Mambo',
        image: 'img/productos/eco-mambo-trichoderma.jpg',
        sizes: [{size: '30ml', price: 6500}],
        description: 'Hongo beneficioso',
        featured: false,
        offer: false
    },
    {
        id: 56,
        name: 'Control Plaga Suelo',
        category: 'plaguicidas',
        brand: 'Eco Mambo',
        image: 'img/productos/control-plaga-suelo.jpg',
        sizes: [{size: '100ml', price: 3400}],
        description: 'Protección radicular',
        featured: false,
        offer: false
    },
    {
        id: 57,
        name: 'Cactus y Suculentas',
        category: 'plaguicidas',
        brand: 'Eco Mambo',
        image: 'img/productos/eco-mambo-cactus-suculentas.jpg',
        sizes: [{size: '100ml', price: 2900}],
        description: 'Especial cactáceas',
        featured: false,
        offer: false
    },
    {
        id: 58,
        name: 'Mosca Blanca',
        category: 'plaguicidas',
        brand: 'Eco Mambo',
        image: 'img/productos/eco-mambo-mosca-blanca.jpg',
        sizes: [{size: '30ml', price: 2600}],
        description: 'Contra mosca blanca',
        featured: false,
        offer: false
    },
    {
        id: 59,
        name: 'Arañuela',
        category: 'plaguicidas',
        brand: 'Eco Mambo',
        image: 'img/productos/eco-mambo-arañuela.jpg',
        sizes: [{size: '30ml', price: 2600}],
        description: 'Anti araña roja',
        featured: false,
        offer: false
    },
    {
        id: 60,
        name: 'Humus Lombriz Californiana',
        category: 'plaguicidas',
        brand: 'Eco Mambo',
        image: 'img/productos/eco-mambo-humus-lombriz.jpg',
        sizes: [{size: '250ml', price: 6500}],
        description: 'Humus líquido',
        featured: false,
        offer: false
    },
    {
        id: 61,
        name: 'Fixa MZN',
        category: 'plaguicidas',
        brand: 'Eco Mambo',
        image: 'img/productos/eco-mambo-fixa.jpg',
        sizes: [{size: '30ml', price: 8700}],
        description: 'Hongo entomopatógeno',
        featured: false,
        offer: false
    },
    {
        id: 62,
        name: 'Acrecio',
        category: 'plaguicidas',
        brand: 'Eco Mambo',
        image: 'img/productos/eco-mambo-acrecio.jpg',
        sizes: [{size: '200gr', price: 12000}],
        description: 'Elimina colonias',
        featured: false,
        offer: false
    },
    {
        id: 63,
        name: 'Glacoxan',
        category: 'plaguicidas',
        brand: 'Glacoxan',
        image: 'img/productos/glacoxan.jpg',
        sizes: [{size: '100ml', price: 3800}],
        description: 'Fijador y adherente',
        featured: false,
        offer: false
    },

    // HORTAL
    {
        id: 64,
        name: 'hormiguicida liquido',
        category: 'plaguicidas',
        brand: 'Hortal',
        image: 'img/productos/hortal-liquido.jpg',
        sizes: [{size: '100ml', price: 16200}],
        description: 'Bioestimulante',
        featured: false,
        offer: false
    },
    
    
    {
        id: 65,
        name: 'Hormiguicida',
        category: 'plaguicidas',
        brand: 'Hortal',
        image: 'img/productos/hortal-talquera.jpg',
        sizes: [{size: '500ml', price: 3800}],
        description: 'Potente hormiguicida',
        featured: false,
        offer: false
    },
    
    // GREEN LEAF
    {
        id: 66,
        name: 'Trips',
        category: 'plaguicidas',
        brand: 'Green Leaf',
        image: 'img/productos/green-leaf-trips.jpg',
        sizes: [{size: '100ml', price: 3800}],
        description: 'Control de trips',
        featured: false,
        offer: false
    },
    {
        id: 67,
        name: 'Diatomea Green Leaf',
        category: 'plaguicidas',
        brand: 'Green Leaf',
        image: 'img/productos/green-leaf-diatomea.jpg',
        sizes: [{size: '250gr', price: 4200}],
        description: 'Tierra de diatomeas',
        featured: false,
        offer: false
    },
    
    // LA POTA
    {
        id: 68,
        name: 'Diatomea La Pota',
        category: 'plaguicidas',
        brand: 'La Pota',
        image: 'img/productos/la-pota-diatomea.jpg',
        sizes: [
            {size: '150gr', price: 4000},
            {size: '500gr', price: 7000}
        ],
        description: 'Tierra de diatomeas',
        featured: false,
        offer: false
    },
    {
        id: 105 ,
        name: 'jabon potasico La Pota',
        category: 'plaguicidas',
        brand: 'La Pota',
        image: 'img/productos/jabon-potasico-la-pota.jpg',
        sizes: [
            {size: '250gr', price: 4370},
            {size: '100gr', price: 3700}
        ],
        description: 'Jabón potásico',

        featured: false,
        offer: false
    },
{
        id: 106,
        name: 'jabon potasico canela y neem La Pota',
        category: 'plaguicidas',
        brand: 'La Pota',
        image: 'img/productos/la-pota-jabon-potasico-neem-y-canela.jpg',
        sizes: [
            {size: '150gr', price: 6600},
            {size: '500gr', price: 3700}
        ],
        description: 'Jabón potásico canela y neem',

        featured: false,
        offer: false
    },
    
    // ==========================================
    // HERRAMIENTAS
    // ==========================================
    
    // MEDIDORES
    {
        id: 5107,
        name: 'lupa sin broche',
        category: 'herramientas',
        brand: 'lupa',
        image: 'img/productos/lupa-sinbroche.jpg',
        sizes: [{size: '1u', price: 11500}],
        description: 'Lupa sin broche',
        featured: true,
        offer: false
    },
    {
        id: 5113,
        name: 'lupa con broche',
        category: 'herramientas',
        brand: 'lupa',
        image: 'img/productos/lup-broche.jpg',
        sizes: [{size: '1u', price: 12500}],
        description: 'Lupa con broche',
        featured: true,
        offer: false
    },
    {
        id: 5108,
        name: 'timer mecanico',
        category: 'herramientas',
        brand: 'timer',
        image: 'img/productos/timer.jpg',
        sizes: [{size: '1u', price: 16000}],
        description: 'Timer mecanico',

        featured: true,
        offer: false
    },
    {
        id: 5109,
        name: 'red scrog',
        category: 'herramientas',
        brand: 'red',
        image: 'img/productos/red-scrog.jpg',
        sizes: [
            {size: '60x60', price: 6900},
            {size: '80x80', price: 7200},
            {size: '100x100', price: 7600},
            {size: '120x120', price: 8000},
            {size: '150x150', price: 8500}
        ],
        description: 'Red scrog',
        featured: true,
        offer: false
    },
    {
        id: 5110,
        name: 'red scrog terra',
        category: 'herramientas',
        brand: 'red',
        image: 'img/productos/red.jpg',
        sizes: [
            {size: '100x100', price: 18000},
            {size: '120x120', price: 28000},
        ],
        description: 'Red scrog',

        featured: true,
        offer: false
    },
    {
        id: 5111,
        name: 'termohigrometro',
        category: 'herramientas',
        brand: 'termohigrometro',
        image: 'img/productos/termohigrometro.jpg',
        sizes: [{size: '1u', price: 15000}],
        description: 'Termohigrometro',

        featured: true,
        offer: false
    },
    {
        id: 5112,
        name: 'cooler',
        category: 'herramientas',
        brand: 'cooler',
        image: 'img/productos/cooler.jpg',
        sizes: [{size: '1u', price: 31000}],
        description: 'Cooler',
        featured: true,
        offer: false
    },
    {
        id: 5569,
        name: 'Medidor pH',
        category: 'herramientas',
        brand: 'New haze',
        image: 'img/productos/medidor-ph.jpg',
        sizes: [{size: '1u', price: 32000}],
        description: 'Medidor digital de pH',
        featured: true,
        offer: false
    },
    {
        id: 5570,
        name: 'Medidor EC',
        category: 'herramientas',
        brand: 'New haze',
        image: 'img/productos/medidor-ec.jpg',
        sizes: [{size: '1u', price: 20000}],
        description: 'Medidor de electroconductividad',
        featured: false,
        offer: false
    },
{
        id: 5570,
        name: 'Malla de secado',
        category: 'herramientas',
        brand: 'New haze',
        image: 'img/productos/malla-azul.jpg',
        sizes: [{size: '1u', price: 20000}],
        description: 'Malla de secado ',
        featured: false,
        offer: false
    },
    {
        id: 5570,
        name: 'Malla de secado',
        category: 'herramientas',
        brand: 'New haze',
        image: 'img/productos/malla-negra.jpg',
        sizes: [{size: '1u', price: 20000}],
        description: 'Malla de secado ',
        featured: false,
        offer: false
    },
    
    // TIJERAS
    {
        id: 71,
        name: 'Tijera Negra Mango Corto',
        category: 'herramientas',
        brand: 'Tijeras',
        image: 'img/productos/tijera-corta.jpg',
        sizes: [{size: '1u', price: 3000}],
        description: 'Tijera de poda mango corto',
        featured: false,
        offer: false
    },
    {
        id: 72,
        name: 'Tijera Negra Mango Largo',
        category: 'herramientas',
        brand: 'Tijeras',
        image: 'img/productos/tijera-larga.jpg',
        sizes: [{size: '1u', price: 3500}],
        description: 'Tijera de poda mango largo',
        featured: false,
        offer: false
    },
    {
        id: 73,
        name: 'Tijera Cosecha Blister',
        category: 'herramientas',
        brand: 'Tijeras',
        image: 'img/productos/tijera-blister.jpg',
        sizes: [{size: '1u', price: 3500}],
        description: 'Tijera especial cosecha',
        featured: false,
        offer: false
    },
    {
        id: 74,
        name: 'Tijera con Ojal',
        category: 'herramientas',
        brand: 'Tijeras',
        image: 'img/productos/tijera-ojal.jpg',
        sizes: [{size: '1u', price: 2900}],
        description: 'Tijera ergonómica con ojal',
        featured: false,
        offer: false
    },
    
    // ARTICULOS DE CULTIVO
    {
        id: 75,
        name: 'Integra Boost 55%',
        category: 'herramientas',
        brand: 'Artículos Cultivo',
        image: 'img/productos/integra-boost-55.jpg',
        sizes: [{size: '4g', price: 6200}],
        description: 'Control humedad 55%',
        featured: false,
        offer: false
    },
    {
        id: 76,
        name: 'Integra Boost 62%',
        category: 'herramientas',
        brand: 'Artículos Cultivo',
        image: 'img/productos/integra-boost-62.jpg',
        sizes: [{size: '8g', price: 8000}],
        description: 'Control humedad 62%',
        featured: false,
        offer: false
    },
    {
        id: 77,
        name: 'Checkpoint',
        category: 'herramientas',
        brand: 'Artículos Cultivo',
        image: 'img/productos/checkpoint.jpg',
        sizes: [
            {size: '25gr', price: 5800},
            {size: '15gr', price: 4800}
        ],
        description: 'Conservador de humedad',
        featured: false,
        offer: false
    },
    {
        id: 78,
        name: 'Buffer pH 4.01',
        category: 'herramientas',
        brand: 'New haze',
        image: 'img/productos/buffer.jpg',
        sizes: [{size: '50ml', price: 5500}],
        description: 'Solución calibración pH 4.01',
        featured: false,
        offer: false
    },
    {
        id: 79,
        name: 'Buffer pH 6.86',
        category: 'herramientas',
        brand: 'New haze',
        image: 'img/productos/buffer.jpg',
        sizes: [{size: '50ml', price: 5500}],
        description: 'Solución calibración pH 6.86',
        featured: false,
        offer: false
    },
    {
        id: 80,
        name: 'Buffer pH 9.18',
        category: 'herramientas',
        brand: 'New haze',
        image: 'img/productos/buffer.jpg',
        sizes: [{size: '50ml', price: 5500}],
        description: 'Solución calibración pH 9.18',
        featured: false,
        offer: false
    },
    {
        id: 81,
        name: 'Jabón Electrodos',
        category: 'herramientas',
        brand: 'New haze',
        image: 'img/productos/jabon.jpg',
        sizes: [{size: '1u', price: 6000}],
        description: 'Limpiador para electrodos',
        featured: false,
        offer: false
    },
    
    // PULVERIZADORES
    {
        id: 82,
        name: 'Multi Spray Giber',
        category: 'herramientas',
        brand: 'Giber',
        image: 'img/productos/giber-1lt.jpg',
        sizes: [
            {size: '7lt', price: 101000},
            {size: '5lt', price: 97000},
            {size: '1lt', price: 36000}
        ],
        description: 'Pulverizador presión',
        featured: false,
        offer: false
    },

    {
        id: 83,
        name: 'Giber Blanco',
        category: 'herramientas',
        brand: 'Giber',
        image: 'img/productos/giber-1l.jpg',
        sizes: [
            {size: '1lt', price: 7500},
            {size: '1/2lt', price: 6500}
        ],
        description: 'Pulverizador manual blanco',
        featured: false,
        offer: false
    },
    {
        id: 84,
        name: 'Pulverizador Transparente',
        category: 'herramientas',
        brand: 'Pulverizadores',
        image: 'img/productos/pulverizador.jpg',
        sizes: [{size: '1u', price: 2500}],
        description: 'Pulverizador transparente',
        featured: false,
        offer: false
    },
    
    // ==========================================
    // MACETAS
    // ==========================================
    
    // MAD ROCKET
    {
        id: 85,
        name: 'Mad Rocket',
        category: 'macetas',
        brand: 'Mad Rocket',
        image: 'img/productos/mad-rocket.jpg',
        sizes: [
            {size: '25lts', price: 15000},
            {size: '16lts', price: 9500},
            {size: '10lts', price: 6000},
            {size: '5lts', price: 5000}
        ],
        description: 'Maceta geotextil premium',
        featured: true,
        offer: false
    },
    
    // SOPLADAS
    {
        id: 86,
        name: 'Maceta Soplada',
        category: 'macetas',
        brand: 'Sopladas',
        image: 'img/productos/sopladas.jpg',
        sizes: [
            {size: '30lt', price: 5200},
            {size: '20lt', price: 3500},
            {size: '15lt', price: 1700},
            {size: '10lt', price: 1300},
            {size: '7lt', price: 1000},
            {size: '5lt', price: 800},
            {size: '3lt', price: 400},
            {size: '1lt', price: 350},
            {size: '500ml', price: 250},
            {size: '250ml', price: 200}
        ],
        description: 'Maceta plástico soplado',
        featured: false,
        offer: false
    },
    
    // GEOTEXTILES
    {
        id: 87,
        name: 'Maceta Geotextil',
        category: 'macetas',
        brand: 'Geotextiles',
        image: 'img/productos/geotextiles.jpg',
        sizes: [
            {size: '200lt', price: 19000},
            {size: '100lt', price: 12000},
            {size: '80lt', price: 10000},
            {size: '40lt', price: 9000},
            {size: '30lt', price: 6500},
            {size: '25lt', price: 5500},
            {size: '24lt', price: 5000},
            {size: '12,5lt', price: 4800},
            {size: '10lt', price: 4200},
            {size: '5lt', price: 1700},
            {size: '4lt', price: 1400}
        ],
        description: 'Maceta geotextil transpirable',
        featured: true,
        offer: false
    },
    
    // ==========================================
    // PARAFERNALIA
    // ==========================================
    
    // PIPAS
    {
        id: 88,
        name: 'Pipa Metal',
        category: 'parafernalia',
        brand: 'Pipas',
        image: 'img/productos/pipa-metal.jpg',
        sizes: [{size: '1u', price: 1500}],
        description: 'Pipa de metal resistente',
        featured: false,
        offer: false
    },
    {
        id: 89,
        name: 'Pipa Madera',
        category: 'parafernalia',
        brand: 'Pipas',
        image: 'img/productos/pipa-madera.jpg',
        sizes: [{size: '1u', price: 2800}],
        description: 'Pipa de madera artesanal',
        featured: false,
        offer: false
    },
    {
        id: 90,
        name: 'Turbina',
        category: 'parafernalia',
        brand: 'Pipas',
        image: 'img/productos/turbina.jpg',
        sizes: [{size: '1u', price: 3500}],
        description: 'Pipa tipo turbina',
        featured: false,
        offer: false
    },
    {
        id: 91,
        name: 'Bong',
        category: 'parafernalia',
        brand: 'Pipas',
        image: 'img/productos/bong.jpg',
        sizes: [{size: '1u', price: 8500}],
        description: 'Bong de vidrio',
        featured: true,
        offer: false
    },
    {
        id: 92,
        name: 'Otros Accesorios',
        category: 'parafernalia',
        brand: 'Pipas',
        image: 'img/productos/accesorios-varios.jpg',
        sizes: [{size: '1u', price: 2000}],
        description: 'Accesorios varios',
        featured: false,
        offer: false
    },
    
    // PICADORES
    {
        id: 93,
        name: 'Picador Acero',
        category: 'parafernalia',
        brand: 'Picadores',
        image: 'img/productos/picador-acero.jpg',
        sizes: [{size: '1u', price: 2500}],
        description: 'Grinder de acero inoxidable',
        featured: false,
        offer: false
    },
    {
        id: 94,
        name: 'Picador Acrílico',
        category: 'parafernalia',
        brand: 'Picadores',
        image: 'img/productos/picador-acrilico.jpg',
        sizes: [{size: '1u', price: 1200}],
        description: 'Grinder acrílico transparente',
        featured: false,
        offer: false
    },
    {
        id: 95,
        name: 'Picador Metal',
        category: 'parafernalia',
        brand: 'Picadores',
        image: 'img/productos/picador-metal.jpg',
        sizes: [{size: '1u', price: 1800}],
        description: 'Grinder metálico',
        featured: false,
        offer: false
    },
    {
        id: 96,
        name: 'Picador Madera',
        category: 'parafernalia',
        brand: 'Picadores',
        image: 'img/productos/picador-madera.jpg',
        sizes: [{size: '1u', price: 2200}],
        description: 'Grinder de madera natural',
        featured: false,
        offer: false
    },
    {
        id: 97,
        name: 'Picador Cerámica',
        category: 'parafernalia',
        brand: 'Picadores',
        image: 'img/productos/picador-ceramica.jpg',
        sizes: [{size: '1u', price: 3200}],
        description: 'Grinder cerámico premium',
        featured: true,
        offer: false
    },
    
    // FILTROS
    {
        id: 98,
        name: 'Tips',
        category: 'parafernalia',
        brand: 'Filtros',
        image: 'img/productos/tips.jpg',
        sizes: [{size: '1u', price: 1200}],
        description: 'Tips para armar',
        featured: false,
        offer: false
    },
    {
        id: 99,
        name: 'Filtros Cónicos',
        category: 'parafernalia',
        brand: 'Filtros',
        image: 'img/productos/filtros-conicos.jpg',
        sizes: [{size: '1u', price: 1500}],
        description: 'Filtros pre-armados cónicos',
        featured: false,
        offer: false
    },
    {
        id: 100,
        name: 'Pre-rolled',
        category: 'parafernalia',
        brand: 'Filtros',
        image: 'img/productos/prerolled.jpg',
        sizes: [{size: '1u', price: 2400}],
        description: 'Filtros pre-enrollados',
        featured: false,
        offer: false
    },
    {
        id: 101,
        name: 'Filtro Vidrio',
        category: 'parafernalia',
        brand: 'Filtros',
        image: 'img/productos/filtro-vidrio.jpg',
        sizes: [{size: '1u', price: 1500}],
        description: 'Boquilla de vidrio reutilizable',
        featured: false,
        offer: false
    },
    {
        id: 102,
        name: 'Filtito',
        category: 'parafernalia',
        brand: 'Filtros',
        image: 'img/productos/filtito.jpg',
        sizes: [{size: '1u', price: 1200}],
        description: 'Filtros pequeños',
        featured: false,
        offer: false
    },
    
    // TABACO
    {
        id: 103,
        name: 'Cerrito',
        category: 'parafernalia',
        brand: 'Tabaco',
        image: 'img/productos/cerrito.jpg',
        sizes: [{size: '1u', price: 6800}],
        description: 'Tabaco Cerrito',
        featured: false,
        offer: false
    },
    {
        id: 104,
        name: 'Sayri',
        category: 'parafernalia',
        brand: 'Tabaco',
        image: 'img/productos/sayri.jpg',
        sizes: [{size: '1u', price: 6500}],
        description: 'Tabaco Sayri',
        featured: false,
        offer: false
    },
    
    // LION ROLLING CIRCUS - PAPELES
    {
        id: 1106,
        name: 'Silver',
        category: 'papeles',
        brand: 'Lion Rolling Circus',
        image: 'img/productos/lion-rolling-silver.jpg',
        sizes: [{size: '1u', price: 1500},],
        description: 'Papel ultra delgado tamaño regular',
        featured: false,
        offer: false
    },
    {
        id: 1107,
        name: 'Unbleached',
        category: 'papeles',
        brand: 'Lion Rolling Circus',
        image: 'img/productos/lion-rolling-unbleached.jpg',
        sizes: [{size: '1u', price: 1500},],
        description: 'Papel sin blanquear tamaño regular',
        featured: false,
        offer: false
    },
    {
        id: 1105,
        name: 'silver kings',
        category: 'papeles',
        brand: 'Lion Rolling Circus',
        image: 'img/productos/lion-rolling-silver-ks.jpg',
        sizes: [{size: '1u', price: 2200}],
        description: 'Papel celulosa tamaño king',
        featured: false,
        offer: false
    },
    {
        id: 1109,
        name: 'unbleached kings',
        category: 'papeles',
        brand: 'Lion Rolling Circus',
        image: 'img/productos/lion-rolling-unbleached-ks.jpg',
        sizes: [{size: '1u', price: 2200}],
        description: 'Papel sin blanquear tamaño king',
        featured: false,
        offer: false
    },
    {
        id: 1108,
        name: 'Celulosa',
        category: 'papeles',
        brand: 'Lion Rolling Circus',
        image: 'img/productos/lion-rolling-celulosa.jpg',
        sizes: [{size: '1u', price: 2500}],
        description: 'Papel celulosa',
        featured: false,
        offer: false
    },
    {
        id: 1111,
        name: 'Celulosa king',
        category: 'papeles',
        brand: 'Lion Rolling Circus',
        image: 'img/productos/lion-rolling-king-celulosa.jpg',
        sizes: [{size: '1u', price:3200}],
        description: 'Papel celulosa tamaño king',
        featured: false,
        offer: false
    },
    {
        id: 1112,
        name: 'Celulosa 420',
        category: 'papeles',
        brand: 'Lion Rolling Circus',
        image: 'img/productos/lion-rolling-420.jpg',
        sizes: [{size: '1u', price: 6000}],
        description: 'Papel celulosa tamaño regular',
        featured: false,
        offer: false
    },
    {
        id: 1109,
        name: 'Sabor Strawberry',
        category: 'papeles',
        brand: 'Lion Rolling Circus',
        image: 'img/productos/lion-rolling-frutilla.jpg',
        sizes: [{size: '1u', price: 1800}],
        description: 'Papel saborizado frutilla',
        featured: false,
        offer: false
    },
    {
        id: 1110,
        name: 'Sabor Coco',
        category: 'papeles',
        brand: 'Lion Rolling Circus',
        image: 'img/productos/lion-rolling-coco.jpg',
        sizes: [{size: '1u', price: 1800}],
        description: 'Papel saborizado coco',
        featured: false,
        offer: false
    },
    {
        id: 1121,
        name: 'Sabor Bubblegum',
        category: 'papeles',
        brand: 'Lion Rolling Circus',
        image: 'img/productos/lion-rolling-bubble.jpg',
        sizes: [{size: '1u', price: 1800}],
        description: 'Papel saborizado bubblegum',
        featured: false,
        offer: false
    },
    {
        id: 1122,
        name: 'Sabor Chocolate',
        category: 'papeles',
        brand: 'Lion Rolling Circus',
        image: 'img/productos/lion-rolling-chocolate.jpg',
        sizes: [{size: '1u', price: 1800}],
        description: 'Papel saborizado chocolate',
        featured: false,
        offer: false
    },
    {
        id: 1113,
        name: 'Sabor Banana ',
        category: 'papeles',
        brand: 'Lion Rolling Circus',
        image: 'img/productos/lion-rolling-banana.jpg',
        sizes: [{size: '1u', price: 1800}],
        description: 'Papel saborizado banana',
        featured: false,
        offer: false
    },
    {
        id: 1114,
        name: 'Sabor Grape',
        category: 'papeles',
        brand: 'Lion Rolling Circus',
        image: 'img/productos/lion-rolling-grape.jpg',
        sizes: [{size: '1u', price: 1800}],
        description: 'Papel saborizado grape',
        featured: false,
        offer: false
    },
    {
        id: 1115,
        name: 'Sabor Blueberry',
        category: 'papeles',
        brand: 'Lion Rolling Circus',
        image: 'img/productos/lion-rolling-blueberry.jpg',
        sizes: [{size: '1u', price: 1800}],
        description: 'Papel saborizado blueberry',
        featured: false,
        offer: false
    },
    {
        id: 1116,
        name: 'Sabor Cherry',
        category: 'papeles',
        brand: 'Lion Rolling Circus',
        image: 'img/productos/lion-rolling-cherry.jpg',
        sizes: [{size: '1u', price: 1800}],
        description: 'Papel saborizado cherry',
        featured: false,
        offer: false
    },
    // LION ROLLING CIRCUS - HEMPS WRAPS
    {
        id: 1117,
        name: 'LRC Hemp Wrap Tequila',
        category: 'papeles',
        brand: 'Lion Rolling Circus',
        image: 'img/productos/lion-rolling-hemp-wrap-tequila.jpg',
        sizes: [{size: '1u', price: 3200}],
        description: 'Wrap de cáñamo sabor tequila',
        featured: false,
        offer: false
    },
    {
        id: 1118,
        name: 'LRC Hemp Wrap Mango',
        category: 'papeles',
        brand: 'Lion Rolling Circus',
        image: 'img/productos/lion-rolling-hemp-wrap-mango.jpg',
        sizes: [{size: '1u', price: 3200}],
        description: 'Wrap de cáñamo sabor mango',
        featured: false,
        offer: false
    },
    {
        id: 1119,
        name: 'LRC Hemp Wrap Chocolate',
        category: 'papeles',
        brand: 'Lion Rolling Circus',
        image: 'img/productos/lion-rolling-hemp-wrap-chocolate.jpg',
        sizes: [{size: '1u', price: 3200}],
        description: 'Wrap de cáñamo sabor chocolate',
        featured: false,
        offer: false
    },
    {
        id: 1120,
        name: 'LRC Hemp Wrap Natural',
        category: 'papeles',
        brand: 'Lion Rolling Circus',
        image: 'img/productos/lion-rolling-hemp-wrap-natural.jpg',
        sizes: [{size: '1u', price: 3200}],
        description: 'Wrap de cáñamo natural',
        featured: false,
        offer: false
    },
    {
        id: 1121,
        name: 'LRC Hemp Wrap bubblegum',
        category: 'papeles',
        brand: 'Lion Rolling Circus',
        image: 'img/productos/lion-rolling-hemp-wrap-bubble.jpg',
        sizes: [{size: '1u', price: 3200}],
        description: 'Wrap de cáñamo sabor chicle',
        featured: false,
        offer: false
    },
    {
        id: 1122,
        name: 'LRC Hemp Wrap Blueberry',
        category: 'papeles',
        brand: 'Lion Rolling Circus',
        image: 'img/productos/lion-rolling-hemp-wrap-blue-berry.jpg',
        sizes: [{size: '1u', price: 3200}],
        description: 'Wrap de cáñamo sabor blueberry',
        featured: false,
        offer: false
    },
    {
        id: 1123,
        name: 'LRC Hemp Wrap Strawberry',
        category: 'papeles',
        brand: 'Lion Rolling Circus',
        image: 'img/productos/lion-rolling-hemp-wrap-strawberry.jpg',
        sizes: [{size: '1u', price: 3200}],
        description: 'Wrap de cáñamo sabor frutilla',
        featured: false,
        offer: false
    },
    {
        id: 1124,
        name: 'LRC Hemp Wrap Gelato',
        category: 'papeles',
        brand: 'Lion Rolling Circus',
        image: 'img/productos/lion-rolling-hemp-wrap-gelato.jpg',
        sizes: [{size: '1u', price: 3500}],
        description: 'Wrap de cáñamo sabor gelato',
        featured: false,
        offer: false
    },
    {
        id: 1125,
        name: 'LRC Hemp Wrap Gorilla Glue',
        category: 'papeles',
        brand: 'Lion Rolling Circus',
        image: 'img/productos/lion-rolling-hemp-wrap-gorilla-gl.jpg',
        sizes: [{size: '1u', price: 3500}],
        description: 'Wrap de cáñamo Gorilla Glue',
        featured: false,
        offer: false
    },
    {
        id: 1126,
        name: 'LRC Hemp Wrap tangie',
        category: 'papeles',
        brand: 'Lion Rolling Circus',
        image: 'img/productos/lion-rolling-hemp-wrap-tangie.jpg',
        sizes: [{size: '1u', price: 3500}],
        description: 'Wrap de cáñamo sabor tangie',
        featured: false,
        offer: false
    },
    {
        id: 1127,
        name: 'LRC Hemp Wrap kksh',
        category: 'papeles',
        brand: 'Lion Rolling Circus',
        image: 'img/productos/lion-rolling-hemp-wrap-kksh.jpg',
        sizes: [{size: '1u', price: 3500}],
        description: 'Wrap de cáñamo sabor kksh',
        featured: false,
        offer: false
    },
    
    {
        id: 1126,
        name: 'LRC Hemp Wrap strawberry-shortcake',
        category: 'papeles',
        brand: 'Lion Rolling Circus',
        image: 'img/productos/lion-rolling-hemp-wrap-strawberry-shortcake.jpg',
        sizes: [{size: '1u', price: 3500}],
        description: 'Wrap de cáñamo sabor strawberry shortcake',
        featured: false,
        offer: false
    },
    // RAW - PAPELES
    {
        id: 2124,
        name: 'Raw Classic',
        category: 'papeles',
        brand: 'Raw',
        image: 'img/productos/raw-clasic.jpg',
        sizes: [{size: '1u', price: 1900}],
        description: 'Papel Raw Classic regular',
        featured: true,
        offer: false
    },
    {
        id: 2125,
        name: 'Raw Black',
        category: 'papeles',
        brand: 'Raw',
        image: 'img/productos/raw-black.jpg',
        sizes: [{size: '1u', price: 1900}],
        description: 'Papel Raw Black regular',
        featured: false,
        offer: false
    },
    {
        id: 2126,
        name: 'Raw Black Organic',
        category: 'papeles',
        brand: 'Raw',
        image: 'img/productos/raw-black-organic.jpg',
        sizes: [{size: '1u', price: 1900}],
        description: 'Papel Raw Black orgánico',
        featured: false,
        offer: false
    },
    {
        id: 2127,
        name: 'Raw Classic Organic',
        category: 'papeles',
        brand: 'Raw',
        image: 'img/productos/raw-organic.jpg',
        sizes: [{size: '1u', price: 1900}],
        description: 'Papel Raw Classic orgánico',
        featured: false,
        offer: false
    },
    {
        id: 2128,
        name: 'Raw Classic KS',
        category: 'papeles',
        brand: 'Raw',
        image: 'img/productos/raw-clasic-ks.jpg',
        sizes: [{size: '1u', price: 3800}],
        description: 'Papel Raw Classic King Size',
        featured: false,
        offer: false
    },
    {
        id: 2129,
        name: 'Raw Classic Organic KS',
        category: 'papeles',
        brand: 'Raw',
        image: 'img/productos/raw-organic-ks.jpg',
        sizes: [{size: '1u', price: 3800}],
        description: 'Papel Raw Classic Organic KS',
        featured: false,
        offer: false
    },
    {
        id: 2130,
        name: 'Raw Black KS',
        category: 'papeles',
        brand: 'Raw',
        image: 'img/productos/raw-black-ks.jpg',
        sizes: [{size: '1u', price: 3800}],
        description: 'Papel Raw Black King Size',
        featured: false,
        offer: false
    },
    {
        id: 2131,
        name: 'Raw Black Organic KS',
        category: 'papeles',
        brand: 'Raw',
        image: 'img/productos/raw-black-organic-ks.jpg',
        sizes: [{size: '1u', price: 3800}],
        description: 'Papel Raw Black Organic KS',
        featured: false,
        offer: false
    },
    
    {
        id: 2132,
        name: 'Raw artesano',
        category: 'papeles',
        brand: 'Raw',
        image: 'img/productos/raw-artesano.jpg',
        sizes: [{size: 'Monster', price: 6000}],
        description: 'Papel con bandeja origami',
        featured: false,
        offer: false
    },
    {
        id: 2133,
        name: 'Raw Cone 05 stage rawket',
        category: 'papeles',
        brand: 'Raw',
        image: 'img/productos/raw-5-cones.jpg',
        sizes: [{size: 'Medium', price: 12000}],
        description: '5 papeles pre rolled',
        featured: false,
        offer: false
    },
    {
        id: 2134,
        name: 'Raw Change cone huge',
        category: 'papeles',
        brand: 'Raw',
        image: 'img/productos/raw-gigante.jpg',
        sizes: [{size: '1u', price: 55000}],
        description: 'Papel gigante pre rolled',
        featured: false,
        offer: false
    },
    
    // ZEUS - PAPELES
    {
        id: 135,
        name: 'Zeus Celulosa',
        category: 'papeles',
        brand: 'Zeus',
        image: 'img/productos/zeus-celulosa.jpg',
        sizes: [{size: '1u', price: 1500}],
        description: 'Papel celulosa regular',
        featured: false,
        offer: false
    },
    {
        id: 137,
        name: 'Zeus Celulosa Más Ancha',
        category: 'papeles',
        brand: 'Zeus',
        image: 'img/productos/zeus-celulosa-ancha.jpg',
        sizes: [{size: '1u', price: 2000}],
        description: 'Papel celulosa extra ancho',
        featured: false,
        offer: false
    },
    {
        id: 138,
        name: 'Zeus Celulosa Azul',
        category: 'papeles',
        brand: 'Zeus',
        image: 'img/productos/zeus-azul.jpg',
        sizes: [{size: '1u', price: 1200}],
        description: 'Papel celulosa color azul',
        featured: false,
        offer: false
    },
    {
        id: 139,
        name: 'Zeus Celulosa Verde',
        category: 'papeles',
        brand: 'Zeus',
        image: 'img/productos/zeus-verde.jpg',
        sizes: [{size: '1u', price: 1200}],
        description: 'Papel celulosa color verde',
        featured: false,
        offer: false
    },
    {
        id: 140,
        name: 'Zeus Celulosa Rojo',
        category: 'papeles',
        brand: 'Zeus',
        image: 'img/productos/zeus-rojo.jpg',
        sizes: [{size: '1u', price: 1200}],
        description: 'Papel celulosa color rojo',
        featured: false,
        offer: false
    },
    {
        id: 141,
        name: 'Zeus Celulosa Naranja',
        category: 'papeles',
        brand: 'Zeus',
        image: 'img/productos/zeus-naranja.jpg',
        sizes: [{size: '1u', price: 1200}],
        description: 'Papel celulosa color naranja',
        featured: false,
        offer: false
    },
    {
        id: 142,
        name: 'Zeus Dorado',
        category: 'papeles',
        brand: 'Zeus',
        image: 'img/productos/zeus-dorado.jpg',
        sizes: [{size: '1u', price: 800}],
        description: 'Papel dorado especial',
        featured: false,
        offer: false
    },
    {
        id: 143,
        name: 'Zeus Pink',
        category: 'papeles',
        brand: 'Zeus',
        image: 'img/productos/zeus-pink.jpg',
        sizes: [{size: '1u', price: 1000}],
        description: 'Papel color rosa',
        featured: false,
        offer: false
    },
    {
        id: 144,
        name: 'Zeus Green',
        category: 'papeles',
        brand: 'Zeus',
        image: 'img/productos/zeus-green.jpg',
        sizes: [{size: '1u', price: 1000}],
        description: 'Papel color verde',
        featured: false,
        offer: false
    },
    {
        id: 145,
        name: 'Zeus con Chalas',
        category: 'papeles',
        brand: 'Zeus',
        image: 'img/productos/zeus-chalas.jpg',
        sizes: [{size: '1u', price: 1050}],
        description: 'Papel con chalas incluidas',
        featured: false,
        offer: false
    },
    
    // ZEUS - OTROS
    {
        id: 146,
        name: 'Zeus Estuche',
        category: 'papeles',
        brand: 'Zeus',
        image: 'img/productos/zeus-estuche.jpg',
        sizes: [{size: '1u', price: 5500}],
        description: 'Estuche Zeus standard',
        featured: false,
        offer: false
    },
    {
        id: 147,
        name: 'Zeus Estuche Negro',
        category: 'papeles',
        brand: 'Zeus',
        image: 'img/productos/zeus-estuche-negro.jpg',
        sizes: [{size: '1u', price: 3600}],
        description: 'Estuche Zeus negro',
        featured: false,
        offer: false
    },
    {
        id: 148,
        name: 'Zeus Armador Metal',
        category: 'papeles',
        brand: 'Zeus',
        image: 'img/productos/zeus-armador-metal.jpg',
        sizes: [{size: '1u', price: 4500}],
        description: 'Armador metálico',
        featured: false,
        offer: false
    },
    {
        id: 149,
        name: 'Zeus Armador Acrílico',
        category: 'papeles',
        brand: 'Zeus',
        image: 'img/productos/zeus-armador-acrilico.jpg',
        sizes: [{size: '1u', price: 3000}],
        description: 'Armador acrílico',
        featured: false,
        offer: false
    },
    {
        id: 150,
        name: 'Zeus Armador Automático',
        category: 'papeles',
        brand: 'Zeus',
        image: 'img/productos/zeus-armador-auto.jpg',
        sizes: [{size: '1u', price: 7000}],
        description: 'Armador automático',
        featured: false,
        offer: false
    },
    
    // FUMANCHU - PAPELES
    {
        id: 3151,
        name: 'Fumanchu Blanco',
        category: 'papeles',
        brand: 'Fumanchu',
        image: 'img/productos/fumanchu.jpg',
        sizes: [{size: '1u', price: 800}],
        description: 'Papel blanco regular',
        featured: false,
        offer: false
    },
    {
        id: 3152,
        name: 'Fumanchu Blanco KS',
        category: 'papeles',
        brand: 'Fumanchu',
        image: 'img/productos/fumanchu-ks.jpg',
        sizes: [{size: '1u', price: 1000}],
        description: 'Papel blanco King Size',
        featured: false,
        offer: false
    },
    {
        id: 3153,
        name: 'Fumanchu Sin Blanquear',
        category: 'papeles',
        brand: 'Fumanchu',
        image: 'img/productos/fumanchu-unbleached.jpg',
        sizes: [{size: '1u', price: 800}],
        description: 'Papel sin blanquear regular',
        featured: false,
        offer: false
    },
    {
        id: 3155,
        name: 'Fumanchu Sabor Manzana',
        category: 'papeles',
        brand: 'Fumanchu',
        image: 'img/productos/fumanchu-manzana.jpg',
        sizes: [{size: '1u', price: 1500}],
        description: 'Papel saborizado manzana',
        featured: false,
        offer: false
    },
    {
        id: 3156,
        name: 'Fumanchu Sabor Naranja',
        category: 'papeles',
        brand: 'Fumanchu',
        image: 'img/productos/fumanchu-naranja.jpg',
        sizes: [{size: '1u', price: 1500}],
        description: 'Papel saborizado naranja',
        featured: false,
        offer: false
    },
    {
        id: 3157,
        name: 'Fumanchu Sabor Chocolate',
        category: 'papeles',
        brand: 'Fumanchu',
        image: 'img/productos/fumanchu-chocolate.jpg',
        sizes: [{size: '1u', price: 1500}],
        description: 'Papel saborizado chocolate',
        featured: false,
        offer: false
    },
    {
        id: 3158,
        name: 'Fumanchu Sabor Grape',
        category: 'papeles',
        brand: 'Fumanchu',
        image: 'img/productos/fumanchu-grape.jpg',
        sizes: [{size: '1u', price: 1500}],
        description: 'Papel saborizado grape',
        featured: false,
        offer: false
    },
    {
        id: 3159,
        name: 'Fumanchu Sabor Vainilla',
        category: 'papeles',
        brand: 'Fumanchu',
        image: 'img/productos/fumanchu-vainilla.jpg',
        sizes: [{size: '1u', price: 1500}],
        description: 'Papel celulosa vainilla',
        featured: false,
        offer: false
    },
    {
        id: 3160,
        name: 'Fumanchu Celulosa',
        category: 'papeles',
        brand: 'Fumanchu',
        image: 'img/productos/fumanchu-celulosa.jpg',
        sizes: [{size: 'X200', price: 1200}],
        description: 'Pack celulosa',
        featured: false,
        offer: false
    },
    {
        id: 3161,
        name: 'Fumanchu Celulosa X200',
        category: 'papeles',
        brand: 'Fumanchu',
        image: 'img/productos/fumanchu-celulosa-200.jpg',
        sizes: [{size: 'X200', price: 2800}],
        description: 'Pack celulosa x200 hojas',
        featured: false,
        offer: false
    },
    //filtros
    {
        id: 4156,
        name: 'Lion Rolling Circus tips Silver',
        category: 'filtros',
        brand: 'filtro',
        image: 'img/productos/lion-rolling-tips (2).jpg',
        sizes: [{size: 'X200', price: 1500}],
        description: 'filtros silver',
        featured: false,
        offer: false
    },
    {
        id: 4157,
        name: 'Lion Rolling Circus tips Silver large',
        category: 'filtros',
        brand: 'filtro',
        image: 'img/productos/lion-rolling-tips-large.jpg',
        sizes: [{size: 'X200', price: 1500}],
        description: 'filtros silver large',
        featured: false,
        offer: false
    },
    {
        id: 4158,
        name: 'Lion Rolling Circus tips Unbleached large',
        category: 'filtros',
        brand: 'filtro',
        image: 'img/productos/lion-rolling-tips-unbleached.jpg',
        sizes: [{size: 'X200', price:1500}],
        description: 'filtros unbleached large',
        featured: false,
        offer: false
    },
    {
        id: 4159,
        name: 'Lion Rolling Circus tips Unbleached large',
        category: 'filtros',
        brand: 'filtro',
        image: 'img/productos/lion-rolling-tips-unbleached-large.jpg',
        sizes: [{size: 'X200', price: 1500}],
        description: 'filtros unbleached large',
        featured: false,
        offer: false
    },
    {
        id: 4161,
        name: 'Raw tips',
        category: 'filtros',
        brand: 'filtro',
        image: 'img/productos/raw-tips.jpg',
        sizes: [{size: 'X200', price:1500}],
        description: 'filtros Raw',
        featured: false,
        offer: false
    },
{
        id: 4162,
        name: '3 Rayos tips curvos',
        category: 'filtros',
        brand: 'filtro',
        image: 'img/productos/3rayos.jpg',
        sizes: [{size: 'X200', price: 1500}],
        description: 'filtros curvos',
        featured: false,
        offer: false
    },
    {
        id: 4163,
        name: 'Zeus tips Multicolor',
        category: 'filtros',
        brand: 'filtro',
        image: 'img/productos/zeus-tips.jpg',
        sizes: [{size: 'X200', price: 1000}],
        description: 'Zeus tips de colores',
        featured: false,
        offer: false
    },
    
];



// Helper functions
function getCategoryName(category) {
    const names = {
        'fertilizantes': 'Fertilizantes/Nutrientes',
        'plaguicidas': 'Plaguicidas/Insecticidas',
        'herramientas': 'Herramientas',
        'macetas': 'Macetas',
        'parafernalia': 'Parafernalia',
        'papeles': 'Papeles',
        'filtros': 'Filtros',
        'sin-definir': 'Sin Definir'
    };
    return names[category] || category;
}

function getFeaturedProducts() {
    return products.filter(p => p.featured === true);
}

function getOfferProducts() {
    return products.filter(p => p.offer === true);
}

function getProductsByCategory(category) {
    return products.filter(p => p.category === category);
}

function getProductById(id) {
    return products.find(p => p.id === id);
}
