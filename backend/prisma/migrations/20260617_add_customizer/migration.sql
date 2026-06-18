-- NavItem
CREATE TABLE "NavItem" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NavItem_pkey" PRIMARY KEY ("id")
);

-- FooterSection
CREATE TABLE "FooterSection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FooterSection_pkey" PRIMARY KEY ("id")
);

-- FooterLink
CREATE TABLE "FooterLink" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "sectionId" TEXT NOT NULL,
    CONSTRAINT "FooterLink_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "FooterLink" ADD CONSTRAINT "FooterLink_sectionId_fkey"
    FOREIGN KEY ("sectionId") REFERENCES "FooterSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- PageSection
CREATE TABLE "PageSection" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "title" TEXT,
    "body" TEXT,
    "imageUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PageSection_pkey" PRIMARY KEY ("id")
);

-- Seed default nav items
INSERT INTO "NavItem" ("id","label","href","order","isVisible") VALUES
  (gen_random_uuid(), 'Home',     '/',        0, true),
  (gen_random_uuid(), 'Shop',     '/shop',    1, true),
  (gen_random_uuid(), 'Our Story','/about',   2, true),
  (gen_random_uuid(), 'Contact',  '/contact', 3, true);

-- Seed default footer
WITH s1 AS (INSERT INTO "FooterSection" ("id","title","order") VALUES (gen_random_uuid(),'Shop',0) RETURNING "id"),
     s2 AS (INSERT INTO "FooterSection" ("id","title","order") VALUES (gen_random_uuid(),'Support',1) RETURNING "id")
INSERT INTO "FooterLink" ("id","label","href","order","sectionId")
SELECT gen_random_uuid(),'All products','/shop',0,s1.id FROM s1
UNION ALL
SELECT gen_random_uuid(),'Habesha wear','/shop?cat=habesha',1,s1.id FROM s1
UNION ALL
SELECT gen_random_uuid(),'Coffee & ceremony','/shop?cat=coffee',2,s1.id FROM s1
UNION ALL
SELECT gen_random_uuid(),'Contact us','/contact',0,s2.id FROM s2
UNION ALL
SELECT gen_random_uuid(),'Track an order','/orders',1,s2.id FROM s2
UNION ALL
SELECT gen_random_uuid(),'Our story','/about',2,s2.id FROM s2;