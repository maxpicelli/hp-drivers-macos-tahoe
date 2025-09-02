/**
 * @file  hpcp1020series.js
 *
 * ===========================================================
 * Copyright (c) 2008-2010 Marvell International, Ltd.  All Rights Reserved.
 *
 *                        Marvell Confidential
 * ===========================================================
 *
 * @brief  ZJS-wrapped JBIG driver for the HPCP1020 Series (planar color)
 *
 */ 


include("zjs_defs.js")

var zj = {} // holder for ZJS constants
MRVL.print.util.Mixin(MRVL.print.define.ZJS, zj)

var BLOCKSIZE = 64 * 1024
var BLOCKALIGN = 4
var BLOCKPAD = null

var DDMNAME = "hpcp1020series"

// indicates whether the printer can handle HW copies
var _copyAble = 'false'

// real output
var _output = null

// array of structures: { stream:<Stream>, currentBlockSize:<Integer>, currentBlock:<Stream>, total:<Integer>  }
var _buffer = null

// array of MRVL.print.BitonalCompressor; array size is current number of planes
var _bitonalCompressor = null

// active bytes per plane (not necessarily same as codec width)
var _bytesPerPlane = 0

var _StartPageItems;

/*
 *  todo: get these from the setup() callback (synch up with renderer)
 */

//todo: put in shared defs
var DMBIN =
	{
	UPPER: 1,
	ONLYONE: 1,
	LOWER: 2,
	MIDDLE: 3,
	MANUAL: 4,
	ENVELOPE: 5,
	ENVMANUAL: 6,
	AUTO: 7,
	TRACTOR: 8,
	SMALLFMT: 9,
	LARGEFMT: 10,
	LARGECAPACITY: 11,
	CASSETTE: 14,
	FORMSOURCE: 15
	}

//todo: put in shared defs
var DMDUPLEX =
	{
	SIMPLEX: 1,
	VERTICAL: 2,  // aka: long-edge
	HORIZONTAL: 3  // aka: short-edge
	}

var ZJI_CUSTOM =
	{
	PIXELCOUNT_C: 0x8200,
	PIXELCOUNT_M: 0x8201,
	PIXELCOUNT_Y: 0x8202,
	PIXELCOUNT_K: 0x8203,
	PIXELCOUNT_NW_C: 0x8204,
	PIXELCOUNT_NW_M: 0x8205,
	PIXELCOUNT_NW_Y: 0x8206,
	PIXELCOUNT_NW_K: 0x8207
	}

// job options
var _duplexing = DMDUPLEX.SIMPLEX
var _copies =  1
var _collate = 'false'

// page options (!)
var _paperCode =  1  /*DMPAPER_LETTER: 1*/
var _defaultSource =  7  /*DMBIN_AUTO: 7*/
var _mediaType =  0

// todo: move these into shared defs
var PaperCodes = ["Letter",1, "Legal",5, "Executive",7, "A3",8, "A4",9, "A5",11, 
		"B4",12, "B5",13, "Tabloid",17, "Env10",20,"EnvDL",27,
		"EnvC5",28, "EnvISOB5",34, "EnvMonarch",37,
		"A6",70, "16K197x273mm",257, "FanFoldGermanLegal",258, "Postcard",260,
		"DoublePostcardRotated",261, "16K184x260mm",263,
		"16K195x270mm",264, "4x6",268, "5x8",269, "10x15cm",270,
		"8K270x390mm",298, "8K273x394mm", 299, -1 ];

/**
 *  Helper function to set page-level copies based on the '_copyAble' flag
 */
function GetPageCopies(args)
    { return ( _copyAble == "false" ? 1 : args.GetInt(args.copies, _copies)) }

/**
 *  Handy arg getter
 */ 
function GetInt(arg, defaultValue)
	{ var n = parseInt(arg); return isNaN(n) ? defaultValue : n }
	//{ return (typeof(arg) == 'undefined') ? defaultValue : parseInt(arg) }

/**
 *  ZJS chunk maker
 *
 * todo: funnel all chunk types through this routine
 */
function WriteZjsChunk(stream, chunkTag, dataSource, dataSize, dwparam, wparam)
	{
	if (null == stream || typeof(stream) == 'undefined')
		return

	var padding = dataSize % BLOCKALIGN
	if (0 != padding)
		padding = BLOCKALIGN - padding

	var totalRecordSize = zj.sizeof_Chunk + dataSize + padding
	stream.writeUint32(totalRecordSize) // cbSize (total record size)
	stream.writeUint32(chunkTag)  // Type (ZJ_TYPE)
	stream.writeUint32(dwparam)  // dwParam (use varies by Type, e.g. item count)
	stream.writeUint16(wparam)  // wParam (use varies by Type)
	stream.writeUint16(zj.ChunkSignature)  // Signature ('ZZ')

	if (dataSize > 0 && null != dataSource && typeof(dataSource) != 'undefined')
		stream.copyFrom(dataSource, dataSize)

	if (padding > 0)
		{
		BLOCKPAD.rewind()
		stream.copyFrom(BLOCKPAD, padding)
		}

	return totalRecordSize
	}

/**
 *  ZJS chunk maker (items only, no data)
 *
 *  if wparam not specified it will be item byte count
 *
 *  expected format of elements of items array
 *      [ 0: itemTag, 1:itemValue, 2: itemSize(optional), 2: itemType(optional) ]
 *  for example
 *      [ zj.ZJI_DMPAPER, GetInt(args.dmPaperSize, 1), zj.sizeof_Uint32Item, zj.ZJIT_UINT32 ]
 *  or just
 *      [ zj.ZJI_DMPAPER, GetInt(args.dmPaperSize, 1) ]
 */
function WriteZjsChunkWithItems(stream, chunkTag, items, wparam)
	{
	function GetItemTag(x) { return GetInt(x[0], 0) }
	function GetItemValue(x) { return GetInt(x[1], 0) }
	function GetItemSize(x) { return GetInt(x[2], zj.sizeof_Uint32Item) }
	function GetItemType(x) { return GetInt(x[3], zj.ZJIT_UINT32) }

	if (typeof(stream) == 'undefined' || null == stream)
		return

	var itemsByteCount = 0

	if (arguments.length < 3)
		items = []

	for (var i in items)
		itemsByteCount += GetItemSize(items[i])

	stream.writeUint32(zj.sizeof_Chunk + itemsByteCount) // cbSize (total record size)
	stream.writeUint32(chunkTag)  // Type (ZJ_TYPE)
	stream.writeUint32(items.length)  // dwParam (use varies by Type, e.g. item count)
	stream.writeUint16((arguments.length < 4) ? itemsByteCount : wparam)  // wParam (use varies by Type)
	stream.writeUint16(zj.ChunkSignature)  // Signature ('ZZ')

	for (var i in items)
		{
		var current = items[i]
		stream.writeUint32(GetItemSize(current))  // cbSize - assume correct
		stream.writeUint16(GetItemTag(current))  // Item (tag)
		stream.writeUint8(GetItemType(current)) // (data)Type
		stream.writeUint8(0) // bParam
		switch(GetItemType(current))
			{
			case zj.ZJIT_INT32:
				stream.writeInt32(GetItemValue(current))
				break

			case zj.ZJIT_UINT32:
				stream.writeUint32(GetItemValue(current))
				break

			default: // write a dummy int item
				stream.writeInt32(0)
				break
			}
		}

	return zj.sizeof_Chunk + itemsByteCount
	}

function WriteJbig(stream, count, n)
	{
	var output = _buffer[n]
	//println("WriteJbig(" + count + ", " + output.id + ")")

	if (null == output || null == output.stream)
		return

	if (0 == count || null == stream)
		{
		// flush pending
		if (output.currentBlockSize > 0)
			output.total += WriteZjsChunk(output.stream, zj.ZJT_JBIG_BID,
					output.currentBlock, output.currentBlockSize, 0, 0)

		output.total += WriteZjsChunk(output.stream, zj.ZJT_END_JBIG, null, 0, 0, 0)
		}
	else
		{
		while (count > 0)
			{
			var numToDo = Math.min(BLOCKSIZE - output.currentBlockSize, count)
			count -= numToDo

			output.currentBlock.copyFrom(stream, numToDo)
			output.currentBlockSize += numToDo

			if (output.currentBlockSize >= BLOCKSIZE)
				{
				// for JBIG drivers, encoded data crosses chunk boundaries
				output.total += WriteZjsChunk(output.stream, zj.ZJT_JBIG_BID,
						output.currentBlock, output.currentBlockSize, 0, 0)
				output.currentBlockSize = 0
				output.currentBlock.reset()
				}
			}
		}
	}

function WriteJbigHeader(stream, count, n)
	{ _buffer[n].total += WriteZjsChunk(_buffer[n].stream, zj.ZJT_JBIG_BIH, stream, count, 0, 0) }

/**
 *  It is probably worth mentioning that at this layer, for the generic callbacks like 
 *  MRVL.print.renderTarget.beginJob, there should be no calls to access the
 *  DEVMODE or SDDEVMODE or DDMINFO since those will be stubbed
 *  in a non-Windows host.
 */ 

MRVL.print.renderTarget = {}
MRVL.print.renderTarget.setup = function (args)
	{
	// println("["+DDMNAME+"] SETUP");
	// for (var i in args) println('....'+i + '=' + args[i])

	_copies = GetInt(args.copies, _copies)
	_collate = args.collate

	_defaultSource = (args.InputBin == 'ManualSelect') ? DMBIN.MANUAL : DMBIN.AUTO

	// todo: lookup by name; merge default set of names/codes with custom
	// _paperCode = PaperCodes[args.PageMediaSize]
	// if (args.PageMediaSize.slice(0,7) == "Custom.")
	// 	_paperCode = 512
	// if (_paperCode == 'undefined')
	// 	_paperCode = PaperCodes["DMPAPER_DEFAULT"]
	_paperCode = 512
	for (var i = 0; PaperCodes[i] != -1 ; i+=2 )
		{
		if (args.PageMediaSize == PaperCodes[i])
			{
			_paperCode = PaperCodes[i+1];
			break;
			}
		}
 
	_mediaType = GetInt( args.PageMediaType, 0);
	//println("    MediaType: " + _mediaType );
	//println("    MediaSize: " + _paperCode );
	}; /**/


MRVL.print.renderTarget.startJob = function (args)
	{
	// println("["+DDMNAME+"] START_JOB")
	// for (var i in args) println('....'+i + '=' + args[i])

	_output = null

	if (typeof(args.output) != 'undefined')
		{
		_duplexing = (args.Duplexing == 'TwoSidedLongEdge') ? DMDUPLEX.VERTICAL :
					((args.Duplexing == 'TwoSidedShortEdge') ? DMDUPLEX.HORIZONTAL : DMDUPLEX.SIMPLEX)

		_output = args.output

		_output.setBigEndian()
		//_output.setLittleEndian()
		_output.writeInt32(zj.StreamSignature)

		WriteZjsChunkWithItems(_output, zj.ZJT_START_DOC, [
			[ zj.ZJI_DMCOLLATE, GetInt(args.collate, 0) ], /*DMCOLLATE_FALSE: 0*/
			[ zj.ZJI_DMDUPLEX, _duplexing ],
			[ zj.ZJI_PAGECOUNT, GetInt(args.pageCount, 0) ]  // short way
			])
		}

	BLOCKPAD = new MRVL.print.Stream()
	for (var i = 0; i < BLOCKALIGN; i++)
		BLOCKPAD.writeByte(0)
//	for (var i = 0; i < BLOCKALIGN/4; i++)
//		BLOCKPAD.writeInt32(0)
	}

MRVL.print.renderTarget.endJob = function (args)
	{
	//println("["+DDMNAME+"] END_JOB")
	if (null != _output)
		WriteZjsChunk(_output, zj.ZJT_END_DOC, null, 0, 0, 0)
	}

MRVL.print.renderTarget.startPage = function (args)
	{
	//println("["+DDMNAME+"] START_PAGE args.dmPaperSize="+args.dmPaperSize)
	//println("  dmPaperSize=" + GetIntArg(args.dmPaperSize, -1))
	if (null == _output)
		return

	args.rasterX += 7;
	args.rasterX &= ~7;
 
	var bitsPerPixel = Math.max(1, GetInt(args.bitsPerPixel, 1))
	var planes = GetInt(args.planes, 1)
	var bitsPerPlane = GetInt(args.rasterX, 1) * bitsPerPixel
	//var bitsPerLine = planes * bitsPerPlane

	var rasterY = GetInt(args.rasterY, 1)
	var rasterX = 128 * Math.ceil(bitsPerPlane / 128)
	var codecStride = rasterX / 8

	_StartPageItems = [
		[ zj.ZJI_PLANE, planes ],
		[ zj.ZJI_DMPAPER, _paperCode ],
		[ zj.ZJI_DMCOPIES, GetPageCopies(args) ],
		[ zj.ZJI_DMDEFAULTSOURCE, _defaultSource ],
		[ zj.ZJI_DMMEDIATYPE, _mediaType ],
		[ zj.ZJI_NBIE, planes ],
		[ zj.ZJI_RESOLUTION_X, GetInt(args.resolutionX, 0) ],
		[ zj.ZJI_RESOLUTION_Y, GetInt(args.resolutionY, 0) ],
		[ zj.ZJI_RASTER_X, rasterX ],
		[ zj.ZJI_RASTER_Y, rasterY ],
		[ zj.ZJI_VIDEO_BPP, bitsPerPixel ],
		[ zj.ZJI_VIDEO_X, Math.ceil(bitsPerPlane / bitsPerPixel) ],
		[ zj.ZJI_VIDEO_Y, rasterY ] ]

	WriteZjsChunkWithItems(_output, zj.ZJT_START_PAGE, _StartPageItems)

	_bitonalCompressor = new Array(planes)
	_buffer = new Array(_bitonalCompressor.length)
	for (var n = 0; n < _bitonalCompressor.length; n++)
		{
		_bitonalCompressor[n] = new MRVL.print.BitonalCompressor(
				{ width:bitsPerPlane, stride:codecStride, height:rasterY }, WriteJbig, WriteJbigHeader, n)
		if (null != _bitonalCompressor[n])
			{
			_buffer[n] = { stream:(new MRVL.print.Stream()), currentBlock:(new MRVL.print.Stream()), currentBlockSize:0, total:0, id:n }
			_buffer[n].stream.setBigEndian() // should just mimic _output
			_bitonalCompressor[n].start()
			}
		}

	_bytesPerPlane = Math.ceil(bitsPerPlane / 8)
	}

MRVL.print.renderTarget.endPage = function (args)
	{
	if (null == _output)
		return

	var  endPageItems = [
		[ ZJI_CUSTOM.PIXELCOUNT_C, GetInt(args.PIXELCOUNT_C, 0) ],
		[ ZJI_CUSTOM.PIXELCOUNT_M, GetInt(args.PIXELCOUNT_M, 0) ],
		[ ZJI_CUSTOM.PIXELCOUNT_Y, GetInt(args.PIXELCOUNT_Y, 0) ],
		[ ZJI_CUSTOM.PIXELCOUNT_K, GetInt(args.PIXELCOUNT_K, 0) ],

		[ ZJI_CUSTOM.PIXELCOUNT_NW_C, GetInt(args.PIXELCOUNT_NW_C, 0) ],
		[ ZJI_CUSTOM.PIXELCOUNT_NW_M, GetInt(args.PIXELCOUNT_NW_M, 0) ],
		[ ZJI_CUSTOM.PIXELCOUNT_NW_Y, GetInt(args.PIXELCOUNT_NW_Y, 0) ],
		[ ZJI_CUSTOM.PIXELCOUNT_NW_K, GetInt(args.PIXELCOUNT_NW_K, 0) ] ]

	var planeOrder =  [ 2, 1, 0, 3 ]
	var planeId = [ 3, 2, 1, 4 ]
	var c = 0
	var mono = (1 == _bitonalCompressor.length)

	//println( "endPage : copies  = " + _copies )
	//println( "endPage : collate = " + _collate )
	do {
		//println( "endPage : copy " + c )
		if( c > 0 )
			WriteZjsChunkWithItems(_output, zj.ZJT_START_PAGE, _StartPageItems)
		for (var n = 0; n < _bitonalCompressor.length; n++)
			{
			var p = mono ? 0 :planeOrder[n]
			var id = mono ? planeId[3] : planeId[n]

			//println("p=" + p + "id=" + id);

			if( 0 == c )
				_bitonalCompressor[p].end() // calls WriteJbig to flush and terminate

			WriteZjsChunkWithItems(_output, zj.ZJT_START_PLANE, [[ zj.ZJI_PLANE, id ]])

			_buffer[p].stream.copyTo(_output, _buffer[p].total)
			//_output.copyFrom(_buffer[p].stream, _buffer[p].total)

			WriteZjsChunkWithItems(_output, zj.ZJT_END_PLANE, [[ zj.ZJI_PLANE, id ]])

			}
		WriteZjsChunkWithItems(_output, zj.ZJT_END_PAGE, endPageItems)
		c++
		for (var n = 0; n < _bitonalCompressor.length; n++ )
			_buffer[n].stream.rewind()
	} while ( "false"==_collate && (c<_copies) )

	_bitonalCompressor = null // todo: reset and re-use on next page
	_buffer = null // todo: reset and re-use on next page

	//WriteZjsChunk(_output, zj.ZJT_END_PAGE, null, 0, 0, 0)
	//println("["+DDMNAME+"] END_PAGE")
	}

MRVL.print.renderTarget.notify = function (args)
	{
	// println("["+DDMNAME+"] NOTIFY");
	// for (var i in args) println('....'+i + '=' + args[i])

	if (null == _output || null == args)
		return

	if ('Pause' == args.event)
		WriteZjsChunk(_output, zj.ZJT_PAUSE, null, 0, 0, 0)
	else if ('Blank' == args.event)
		{
		// println("*** blank page ***")
		if (null != _StartPageItems)
			{
			WriteZjsChunkWithItems(_output, zj.ZJT_START_PAGE, _StartPageItems)
			WriteZjsChunk(_output, zj.ZJT_END_PAGE, null, 0, 0, 0)
			}
		}
	}

MRVL.print.renderTarget.write = function (src, count, stride)
	{
	if (arguments.length < 3)
		stride = 1

	if (null != _bitonalCompressor)
		{
		// assume stride == 1 for now
		for (var i = 0; i < _bitonalCompressor.length; i++)
			_bitonalCompressor[i].compress(src, 1, _bytesPerPlane)
		}
	}

//})()
