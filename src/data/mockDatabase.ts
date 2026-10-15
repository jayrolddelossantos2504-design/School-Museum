import { MuseumCategory, MuseumItem, AdminUser, ActivityLog } from '../types/museum';

export const INITIAL_CATEGORIES: MuseumCategory[] = [
  {
    categoryId: 1,
    categoryName: 'Historical Artifacts',
    description: 'Physical implements, antique furniture, schoolmaster tools, and revolutionary era relics.'
  },
  {
    categoryId: 2,
    categoryName: 'Photographs',
    description: 'Archival silver-gelatin and monochrome prints documenting graduating classes, faculty, and campus milestones.'
  },
  {
    categoryId: 3,
    categoryName: 'Documents',
    description: 'Official charters, founding legislations, vintage diplomas, school newspapers, and historic manuscripts.'
  },
  {
    categoryId: 4,
    categoryName: 'Memorabilia',
    description: 'Academic medals, rondalla musical instruments, sports pennants, trophies, and commemorative items.'
  }
];

export const INITIAL_ADMINS: AdminUser[] = [
  {
    adminId: 1,
    username: 'admin_gtnhs',
    name: 'Dr. Corazon M. Ramos',
    role: 'admin',
    isActive: true
  },
  {
    adminId: 2,
    username: 'curator_tinio',
    name: 'Prof. Ernesto V. Del Rosario',
    role: 'editor',
    isActive: true
  }
];

export const INITIAL_ITEMS: MuseumItem[] = [
  {
    itemId: 1,
    publicToken: 'gtnhs-tok-1898-tinio',
    itemName: 'General Manuel Tinio Revolutionary Sash & Officer Sabre Replica',
    description: 'Ceremonial silk officer sash embroidered with the sun and stars of the First Philippine Republic, accompanied by an officer sabre and brass valor medals commemorating General Manuel Tinio (1877–1924), youngest general of the Katipunan revolutionary army and hero of Northern Luzon.',
    historicalDetails: 'Manuel Tinio y Bundoc was born in Licab, Nueva Ecija on June 17, 1877. At just twenty years of age, he joined the Katipunan and rose to the rank of Brigadier General in Emilio Aguinaldo’s revolutionary army, making him the youngest Filipino general. In Northern Luzon, General Tinio established guerrilla defense lines across the Ilocos mountains. General Tinio High School, founded in the municipality named in his honor (formerly Papaya), proudly preserves this ceremonial replica display to instill valor, patriotism, and scholastic dedication in every student.',
    categoryId: 1,
    categoryName: 'Historical Artifacts',
    accessionNumber: 'ACC.GTNHS.1966.001',
    era: 'Revolutionary Era (1898) / 1966 Memorial Acquisition',
    dimensions: 'Sabre: 94 cm length · Sash: 165 cm x 18 cm',
    mediumMaterials: 'Hand-woven silk with bullion embroidery, tempered steel, brass, oak display case',
    provenance: 'Donated by the Tinio Historical Heritage Foundation and Municipal Council of General Tinio on the school inaugural year, 1966.',
    locationInMuseum: 'Central Gallery, Pavilion Case 01 (General Tinio Memorial Shrine)',
    curatorNotes: 'Preserved under filtered UV-absorbent museum glass with passive humidity buffering (50% RH).',
    isPublished: true,
    isArchived: false,
    createdBy: 1,
    updatedBy: 1,
    dateAdded: '2024-03-12T08:30:00Z',
    updatedAt: '2024-09-15T14:20:00Z',
    images: [
      {
        imageId: 101,
        itemId: 1,
        imageUrl: '/src/assets/images/artifact_tinio_memorabilia_1791999500846.jpg',
        imagePublicId: 'gtnhs/tinio_memorabilia_case',
        isCover: true,
        caption: 'Full view of General Manuel Tinio memorial showcase on emerald green velvet.',
        uploadedAt: '2024-03-12T08:35:00Z'
      }
    ]
  },
  {
    itemId: 2,
    publicToken: 'gtnhs-tok-1958-typewriter',
    itemName: 'Royal Cast-Iron Office Typewriter & Student Records Ledger (1958)',
    description: 'An original 1950s manual cast-iron Royal typewriter and handwritten hardbound student matriculation registry from the founding administration office.',
    historicalDetails: 'Prior to the introduction of mimeographs and electronic computing, every permanent scholastic record, report card, and DepEd compliance transcript was typed by hand using this heavy cast-iron mechanical typewriter. The accompanying logbook contains the penmanship of pioneer schoolmaster Mr. Luis G. Aquino, who meticulously enrolled the inaugural batch of provincial students. The records survive through intact archival rag-cotton pages.',
    categoryId: 1,
    categoryName: 'Historical Artifacts',
    accessionNumber: 'ACC.GTNHS.1968.014',
    era: 'Post-War Republic Era (1958–1968)',
    dimensions: 'Typewriter: 38 x 35 x 22 cm, 13.8 kg · Ledger: 32 x 45 cm',
    mediumMaterials: 'Cast iron, enamel lacquer, nickel-plated keys, rag paper, calfskin binding',
    provenance: 'Transferred from the Office of the Registrar to the School Heritage Archives in October 1998.',
    locationInMuseum: 'Administrative History Wing, Desk Display 02',
    curatorNotes: 'Key mechanisms oiled with archival mineral lubricant; ribbon replaced with inert facsimile for preservation.',
    isPublished: true,
    isArchived: false,
    createdBy: 2,
    updatedBy: 2,
    dateAdded: '2024-04-05T10:15:00Z',
    updatedAt: '2024-08-20T11:00:00Z',
    images: [
      {
        imageId: 102,
        itemId: 2,
        imageUrl: '/src/assets/images/artifact_vintage_typewriter_1791999500970.jpg',
        imagePublicId: 'gtnhs/vintage_typewriter_desk',
        isCover: true,
        caption: 'Vintage cast-iron manual typewriter alongside open student ledger with fountain pen.',
        uploadedAt: '2024-04-05T10:20:00Z'
      }
    ]
  },
  {
    itemId: 3,
    publicToken: 'gtnhs-tok-1960-diploma',
    itemName: 'Founding Batch High School Graduation Diploma with Golden Wax Seal',
    description: 'An authentic vintage 1960 diploma inscribed on heavy cotton parchment, featuring calligraphy, official division superintendent signatures, and the embossed school seal.',
    historicalDetails: 'This diploma was presented to Mr. Ricardo M. De Leon, an honor student from the early graduating cohort. Issued during the historic transition of secondary education under the Bureau of Public Schools, this document stands as testimony to the rigorous standards and moral character demanded of rural high school graduates in Central Luzon during the 1960s.',
    categoryId: 3,
    categoryName: 'Documents',
    accessionNumber: 'ACC.GTNHS.1960.003',
    era: 'Early High School Program (1960)',
    dimensions: '42 x 29.7 cm (A3 parchment in archival shadowbox)',
    mediumMaterials: 'Vellum paper, black iron gall ink, sealing wax, satin ribbon',
    provenance: 'Bequeathed to the General Tinio NHS Museum by the De Leon Family in memory of the Class of 1960.',
    locationInMuseum: 'Founding Documents Room, Wall Display Frame 03',
    curatorNotes: 'Sealed within an airtight micro-climate enclosure with museum-grade acrylic.',
    isPublished: true,
    isArchived: false,
    createdBy: 1,
    updatedBy: 2,
    dateAdded: '2024-02-18T09:00:00Z',
    updatedAt: '2024-09-01T16:40:00Z',
    images: [
      {
        imageId: 103,
        itemId: 3,
        imageUrl: '/src/assets/images/artifact_vintage_diploma_1791999537085.jpg',
        imagePublicId: 'gtnhs/diploma_case_shadowbox',
        isCover: true,
        caption: 'Archival shadowbox preserving the 1960 Graduation Diploma with golden ribbon and seal.',
        uploadedAt: '2024-02-18T09:10:00Z'
      }
    ]
  },
  {
    itemId: 4,
    publicToken: 'gtnhs-tok-1968-class-photo',
    itemName: 'Vintage Graduating Class Monochrome Portrait & Faculty Roster (1968)',
    description: 'Original framed silver-gelatin photograph showing the faculty and students of Section A & B on the main school portico, dressed in traditional Barong Tagalog and school uniforms.',
    historicalDetails: 'The Class of 1968 witnessed the formal expansion of General Tinio High School into a fully fledged national secondary institution. The photograph captures 48 graduating students alongside legendary pioneer educators. Many graduates depicted in this frame went on to become municipal leaders, teachers, agricultural scientists, engineers, and public servants who shaped modern Nueva Ecija.',
    categoryId: 2,
    categoryName: 'Photographs',
    accessionNumber: 'ACC.GTNHS.1968.042',
    era: 'Classic Era (1968)',
    dimensions: 'Framed size: 55 x 42 cm',
    mediumMaterials: 'Silver gelatin photographic print mounted on acid-free archival board in carved giltwood frame',
    provenance: 'Gift of the GTNHS Alumni Association Class of 1968 on their 50th Golden Jubilee celebration.',
    locationInMuseum: 'Alumni Hall of Fame, West Corridor',
    curatorNotes: 'Digitally restored from original negative; physical print treated for silver oxidation.',
    isPublished: true,
    isArchived: false,
    createdBy: 2,
    updatedBy: 1,
    dateAdded: '2024-05-10T14:00:00Z',
    updatedAt: '2024-07-22T10:10:00Z',
    images: [
      {
        imageId: 104,
        itemId: 4,
        imageUrl: '/src/assets/images/artifact_class_photo_1791999537685.jpg',
        imagePublicId: 'gtnhs/class_photo_1968_frame',
        isCover: true,
        caption: 'Class of 1968 Section A & B posed with faculty members in gilded timber frame.',
        uploadedAt: '2024-05-10T14:15:00Z'
      }
    ]
  },
  {
    itemId: 5,
    publicToken: 'gtnhs-tok-1952-rondalla',
    itemName: 'Handcrafted 14-String Philippine Bandurria & Pioneer Brass School Bell',
    description: 'A masterfully carved Philippine hardwood bandurria with mother-of-pearl soundhole inlays used in the award-winning GTNHS Rondalla ensemble, alongside the original cast brass class bell.',
    historicalDetails: 'Music has always been the heartbeat of General Tinio National High School. The school rondalla ensemble, founded in the 1950s, represented Nueva Ecija in regional and national cultural competitions, celebrating traditional Kundiman, Harana, and Philippine folk melodies. The solid brass bell on the right was rung at 7:00 AM each morning from 1952 until 1984, signaling the start of classes and flag ceremony.',
    categoryId: 4,
    categoryName: 'Memorabilia',
    accessionNumber: 'ACC.GTNHS.1952.008',
    era: 'Mid-Century Cultural Era (1952–1975)',
    dimensions: 'Bandurria: 62 x 26 x 11 cm · Brass Bell: 28 cm height, 6.2 kg',
    mediumMaterials: 'Narra wood, Philippine mahogany, mother-of-pearl inlays, steel strings, cast bell brass',
    provenance: 'Donated by Maestro Teodoro S. Rivera, Founding Director of the GTNHS Rondalla Guild.',
    locationInMuseum: 'Cultural Arts & Performing Heritage Pavilion, Case 04',
    curatorNotes: 'Wood is conditioned biannually with organic tung oil to prevent dry checking.',
    isPublished: true,
    isArchived: false,
    createdBy: 1,
    updatedBy: 1,
    dateAdded: '2024-01-20T11:45:00Z',
    updatedAt: '2024-06-18T15:30:00Z',
    images: [
      {
        imageId: 105,
        itemId: 5,
        imageUrl: '/src/assets/images/artifact_rondalla_instruments_1791999501497.jpg',
        imagePublicId: 'gtnhs/rondalla_bandurria_bell',
        isCover: true,
        caption: 'Traditional 14-string bandurria and pioneer brass school bell in gallery showcase.',
        uploadedAt: '2024-01-20T11:50:00Z'
      }
    ]
  },
  {
    itemId: 6,
    publicToken: 'gtnhs-tok-1974-red-cross',
    itemName: 'Philippine Red Cross Youth National Banner & Medal of Excellence (1974)',
    description: 'Original silk embroidered leadership pennant and brass medal awarded to the GTNHS Junior Red Cross chapter for disaster relief mobilization and first aid training.',
    historicalDetails: 'During typhoon disasters in the plains of Central Luzon throughout the 1970s, GTNHS student volunteers formed the vanguard of community first aid, flood relief distribution, and blood drives. This pennant was bestowed by the Philippine National Red Cross headquarters in Manila.',
    categoryId: 4,
    categoryName: 'Memorabilia',
    accessionNumber: 'ACC.GTNHS.1974.021',
    era: 'Civic Service Era (1974)',
    dimensions: 'Pennant: 85 x 45 cm · Medal: 6 cm diameter',
    mediumMaterials: 'Satin silk banner with gold cord fringe, die-struck brass medallion with enamel inlay',
    provenance: 'Official transfer from the Youth Volunteer Corps archive.',
    locationInMuseum: 'Civic Leadership & Athletics Wing, Case 06',
    curatorNotes: 'Textile supported on non-acidic backing board.',
    isPublished: true,
    isArchived: false,
    createdBy: 2,
    updatedBy: 2,
    dateAdded: '2024-06-02T13:00:00Z',
    updatedAt: '2024-06-02T13:00:00Z',
    images: [
      {
        imageId: 106,
        itemId: 6,
        imageUrl: '/src/assets/images/gtnhs_museum_hero_1791999499631.jpg',
        imagePublicId: 'gtnhs/red_cross_banner',
        isCover: true,
        caption: 'Preserved inside the Excellence in Academics & Civic Service Pavilion.',
        uploadedAt: '2024-06-02T13:05:00Z'
      }
    ]
  },
  {
    itemId: 7,
    publicToken: 'gtnhs-tok-1966-charter',
    itemName: 'Municipal Council Resolution No. 44 & School Establishment Bill',
    description: 'Typed manuscript and carbon duplicate of the historic resolution establishing the high school in the municipality of General Tinio, signed by local officials and school pioneers.',
    historicalDetails: 'On July 14, 1966, through the unified petition of the parents and municipal leadership, Resolution No. 44 authorized the acquisition of school grounds and allocation of initial operating funds. This bill transformed secondary education accessibility for youth across the valley.',
    categoryId: 3,
    categoryName: 'Documents',
    accessionNumber: 'ACC.GTNHS.1966.002',
    era: 'Founding Charter (1966)',
    dimensions: 'Four folio leaves, 35.5 x 21.5 cm',
    mediumMaterials: 'Carbon type on government stationery with stamped municipal dry seal',
    provenance: 'Archival donation from Municipal Hall Archive.',
    locationInMuseum: 'Founding Documents Room, Folio Stand 01',
    curatorNotes: 'Archived under Mylar protective sleeves.',
    isPublished: true,
    isArchived: false,
    createdBy: 1,
    updatedBy: 1,
    dateAdded: '2024-01-15T09:00:00Z',
    updatedAt: '2024-05-12T11:20:00Z',
    images: [
      {
        imageId: 107,
        itemId: 7,
        imageUrl: '/src/assets/images/artifact_vintage_diploma_1791999537085.jpg',
        imagePublicId: 'gtnhs/resolution_44_manuscript',
        isCover: true,
        caption: 'Historic municipal charter founding General Tinio National High School.',
        uploadedAt: '2024-01-15T09:10:00Z'
      }
    ]
  },
  {
    itemId: 8,
    publicToken: 'gtnhs-tok-draft-pioneer-chalkboard',
    itemName: 'Pioneer Narra Wood Teacher Lectern & Slate Blackboard (1962)',
    description: 'Antique schoolroom furnishings used in the very first classroom building, handcrafted by local carpenters from indigenous Philippine narra timber.',
    historicalDetails: 'Before modern whiteboards and digital projectors, generations of GTNHS students solved algebraic equations and parsed literature on this natural slate blackboard with chalk. Currently being conserved in the restoration workshop.',
    categoryId: 1,
    categoryName: 'Historical Artifacts',
    accessionNumber: 'ACC.GTNHS.1962.005',
    era: 'Pioneer Classroom Era (1962)',
    dimensions: 'Lectern: 110 x 60 x 50 cm · Blackboard: 120 x 240 cm',
    mediumMaterials: 'Philippine Narra hardwood, natural slate stone, brass fasteners',
    provenance: 'Salvaged during the 1995 classroom retrofit.',
    locationInMuseum: 'Conservation Laboratory (Restoration In Progress)',
    curatorNotes: 'Under active preservation; scheduled for public unveiling in upcoming anniversary exhibition.',
    isPublished: false, // Draft privacy check!
    isArchived: false,
    createdBy: 2,
    updatedBy: 2,
    dateAdded: '2024-08-10T16:00:00Z',
    updatedAt: '2024-08-10T16:00:00Z',
    images: [
      {
        imageId: 108,
        itemId: 8,
        imageUrl: '/src/assets/images/artifact_vintage_typewriter_1791999500970.jpg',
        imagePublicId: 'gtnhs/pioneer_lectern',
        isCover: true,
        caption: 'Restoration staging of 1962 pioneer classroom lectern.',
        uploadedAt: '2024-08-10T16:05:00Z'
      }
    ]
  }
];

export const INITIAL_LOGS: ActivityLog[] = [
  {
    logId: 1,
    adminId: 1,
    adminUsername: 'admin_gtnhs',
    action: 'CREATE',
    entityType: 'MUSEUM_ITEM',
    entityId: 'gtnhs-tok-1898-tinio',
    details: 'Catalogued General Manuel Tinio Revolutionary Sash & Sabre exhibit.',
    timestamp: '2024-03-12T08:35:00Z'
  },
  {
    logId: 2,
    adminId: 1,
    adminUsername: 'admin_gtnhs',
    action: 'PUBLISH',
    entityType: 'MUSEUM_ITEM',
    entityId: 'gtnhs-tok-1898-tinio',
    details: 'Published exhibit to public catalog and issued permanent QR token.',
    timestamp: '2024-03-12T08:40:00Z'
  },
  {
    logId: 3,
    adminId: 2,
    adminUsername: 'curator_tinio',
    action: 'CREATE',
    entityType: 'MUSEUM_ITEM',
    entityId: 'gtnhs-tok-1958-typewriter',
    details: 'Catalogued 1958 Royal typewriter and inaugural matriculation ledger.',
    timestamp: '2024-04-05T10:20:00Z'
  },
  {
    logId: 4,
    adminId: 1,
    adminUsername: 'admin_gtnhs',
    action: 'IMAGE_UPLOAD',
    entityType: 'MUSEUM_ITEM',
    entityId: 'gtnhs-tok-1960-diploma',
    details: 'Uploaded high-resolution macro scan of 1960 founding graduation diploma.',
    timestamp: '2024-05-10T14:20:00Z'
  }
];

export const HERO_IMAGE_PATH = '/src/assets/images/gtnhs_museum_hero_1791999499631.jpg';
