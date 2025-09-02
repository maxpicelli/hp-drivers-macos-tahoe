/**
 * @file  zjs_defs.js
 *
 * Copyright (c) 2008-2009  Marvell International, Ltd. All Rights Reserved
 *
 *                         Marvell Confidential
 *
 * common definitions for Zx drivers
 */ 


MRVL.print.util = {};

MRVL.print.util.Mixin = function(source, target) {
	var mixin = new Object;
	for (var i in source)
		mixin[i] = source[i];
	mixin.__proto__ = target.__proto__;
	target.__proto__ = mixin;
};


MRVL.print.define = {};

MRVL.print.define.ZJS = {
	/* ZJ_TYPE*/
ZJT_START_DOC: 0,
ZJT_END_DOC: 1,
ZJT_START_PAGE: 2,
ZJT_END_PAGE: 3,
ZJT_JBIG_BIH: 4,
ZJT_JBIG_BID: 5,  /* Bi-level Image Data blocks */
ZJT_END_JBIG: 6,
ZJT_SIGNATURE: 7,
ZJT_RAW_IMAGE: 8,  /* full uncompressed plane follows */
ZJT_START_PLANE: 9,
ZJT_END_PLANE: 10,
ZJT_PAUSE: 11,
ZJT_BITMAP: 12,  /* self-contained image record */
ZJT_ZX_START: 13,  /* header/option block for ZX stream */
ZJT_ZX_DATA: 14,  /* ZX stream data blocks (note: dwParam is active byte count) */
ZJT_ZX_END: 15,
	
	/* ZJ_ITEM */
ZJI_PAGECOUNT: 0,	/* number of ZJT_START_PAGE / ZJT_END_PAGE pairs, if known */
ZJI_DMCOLLATE: 1,	/* from DEVMODE */
ZJI_DMDUPLEX: 2,	/* from DEVMODE */
	
	/* for START_PAGE */
ZJI_DMPAPER: 3,		/* from DEVMODE */
ZJI_DMCOPIES: 4,		/* from DEVMODE */
ZJI_DMDEFAULTSOURCE: 5,	/* from DEVMODE */
ZJI_DMMEDIATYPE: 6,	/* from DEVMODE */
ZJI_NBIE: 7,			/* number of Bi-level Image Entities, */
	/* e.g. 1 for monochrome, 4 for color */
ZJI_RESOLUTION_X: 8, ZJI_RESOLUTION_Y: 9,	/* dots per inch */
ZJI_OFFSET_X: 10, ZJI_OFFSET_Y: 11,		/* upper left corner */
ZJI_RASTER_X: 12, ZJI_RASTER_Y: 13,		/* raster dimensions */
	
ZJI_COLLATE: 14,		/* asks for collated copies */
ZJI_QUANTITY: 15,		/* copy count */
	
ZJI_VIDEO_BPP: 16,		/* video bits per pixel */
ZJI_VIDEO_X: 17, ZJI_VIDEO_Y: 18,		/* video dimensions (if different than raster) */
ZJI_INTERLACE: 19,		/* 0 or 1 */
ZJI_PLANE: 20,			/* enum PLANE */
ZJI_PALETTE: 21,		/* translation table (dimensions in item type) */
	
ZJI_RET: 22,			/* ZJIT_UINT32, RET_xxx enum */
ZJI_TONER_SAVE: 23,		/* 0 == disable, !0 == enable */
	
	/*	ZJI_MEDIA_SIZE_xxx override ZJI_DMPAPER.
	 *	All three ZJI_MEDIA_SIZE_xxx tags must be present to be valid.
	 */
ZJI_MEDIA_SIZE_X: 24,	/* in ZJI_MEDIA_SIZE_UNITS, along fast-scan direction */
ZJI_MEDIA_SIZE_Y: 25,	/* in ZJI_MEDIA_SIZE_UNITS, along slow-scan direction */
ZJI_MEDIA_SIZE_UNITS: 26,	/* 1 == 1/1000 inch, 2 == 1/10 mm */
	
ZJI_CHROMATIC: 27,		/* 0 == monochrome page, !0 = color page */
	
ZJI_PAD: 99,		/* bogus item type for padding stream */
	
    /* for PAUSE */
ZJI_PROMPT: 100,         /* ZJIT_STRING */
	
	/*	for ZJT_BITMAP */
ZJI_BITMAP_TYPE: 101,	/* (required) see BITMAP_TYPE enum */
ZJI_ENCODING_DATA: 102,	/* (optional), ZJIT_BYTELUT, encoding-specific data,
 *  e.g. BIH
 */
ZJI_END_PLANE: 103,		/* 1 == last bitmap for this plane this page */
	
	/*	for ZJT_BITMAP of type BITMAP_RAW */
ZJI_BITMAP_PIXELS: 104,
ZJI_BITMAP_LINES: 105,
ZJI_BITMAP_BPP: 106,
ZJI_BITMAP_STRIDE: 107,
	
	/*	General page color information.
	 These values may be specified in ZJT_START_PAGE but may be
	 overridden by an image entity's own parameters. */
ZJI_COLOR_FORMAT: 108,		/* Each byte holds a color ID; Order of values
 indicates color order in the color data.
 Default is [R,G,B,x] (where 'R' is the
 first appearing byte) if omitted.
 See ZJ_COLOR enum below for defined colors. */
ZJI_COLOR_COMPONENT_SIZE: 109,	/* Bit depth of each color component, in bits.
 Default is 8 if omitted. */
ZJI_COLOR_SIZE: 110,			/* Color value size, in bytes.
 Default is 4 if omitted. */
	
	/*	for ZJT_ZX_START */
ZJI_ZxBITS: 111,				/* Zx options bits (see ZxStream.h) used during
 creation of Zx data.
 Default is ZxBITS_DEFAULT if ommitted. */
	
ZJI_OUTBIN: 112,				/* used to specify the paper output bin */
	
	/* for instrumentation */
ZJI_TIMESTAMP: 0x7FFF,	/* incrementing 32-bit counter for benchmarking */
	
	/* ZJ_ITEM_TYPE */
ZJIT_UINT32: 1,  /* unsigned integer */
ZJIT_INT32: 2,  /* signed integer */
ZJIT_STRING: 3,  /* byte string, NUL-terminated, DWORD-aligned */
ZJIT_BYTELUT: 4,  /* DWORD count followed by that many byte entries */
	
sizeof_Chunk: 16,
sizeof_Uint32Item: 12,
	
StreamSignature: 0x4A5A4A5A, // 0x5A4A5A4A  0x4A5A4A5A
ChunkSignature: 0x5A5A
};
