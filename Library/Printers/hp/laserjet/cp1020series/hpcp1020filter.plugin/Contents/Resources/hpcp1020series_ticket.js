/*
 * @file hpcp1020series_ticket.js
 *
 * ===========================================================
 * Copyright (c) 2009-2010  Marvell International, Ltd. All Rights Reserved
 *
 *                         Marvell Confidential
 * ===========================================================
 *
 * @brief  Print ticket construction for the HPCP1020 Series
 *
 */
MRVL = {};
MRVL.print = {};
MRVL.print.ticket = {};

var orien = "Portrait";

var width = parseFloat( getOption( 'ExtentWidth' ) )
var height = parseFloat( getOption( 'ExtentHeight' ) )
var mediaWidth = parseFloat( getOption( 'ImageableSizeWidth' ) )
var mediaHeight = parseFloat( getOption( 'ImageableSizeHeight' ) )
var left = parseFloat( getOption( 'OriginWidth' ) )
var top = parseFloat( getOption( 'OriginHeight' ) )
var mediaName = getOption("com.apple.print.PageToPaperMappingMediaName");
var orienVal = getOption("orientation-requested");
var mirror = getOption("mirror") === "true";
var hdpi = parseFloat( getOption("ResolutionX"));
var vdpi = parseFloat( getOption("ResolutionY"));
var mediaType = getOption("MediaType");
println("width: " + mediaWidth + " = left: " + left + " + image: " + width + " + right: " + (mediaWidth - width - left));
println("height: " + mediaHeight + " = top: " + top + " + image: " + height + " + bottom: " + (mediaHeight - height - top));

if (hdpi == 0) hdpi = 600;
if (vdpi == 0) vdpi = 600;
// adjust width up to multiple of 8 pixels
var widthup = Math.floor((width * hdpi + 7.5) / 8) * 8 / hdpi;
left -= (widthup - width) / 2;
width = widthup;
var right = mediaWidth - width - left;
var bottom = mediaHeight - height - top;

var Flipped = 0;
var RegionBits = 0;
var cupsManualCopies = true;//getOption("cupsManualCopies") === "true";

// print debug messages
println("mediaName: " + mediaName);
println("orientation: '" + orienVal + "'");
println("ResolutionX: " + hdpi);
println("ResolutionY: " + vdpi);

// set page width and height based on orientation
var tmp;
if (orienVal == 4 || orienVal == 5) { // 90 or 270
	orien = "Landscape";
	tmp = height; height = width; width = tmp;
	tmp = mediaHeight; mediaHeight = mediaWidth; mediaWidth = tmp;
	tmp = top; top = left; left = bottom; bottom = right; right = tmp;
	Flipped = 1; // To have the core flip width/height
	RegionBits = 0x2000; //EEBITS_OBJECT_ROTATION so the page content is rotated
}
if (orienVal == 4 || orienVal == 6) { // 90 or 180
	tmp = top; top = bottom; bottom = tmp;
	tmp = left; left = right; right = tmp;
}
if (mirror) {
	tmp = left; left = right; right = tmp;
	//RegionBits += 0x0080; //EEBITS_MIRROR so the page content is mirrored
}

function getBlackMode(k)
	{
	var v = getOption(k)
	return ((v == "4-Color") ? 4 : 1)
	}

function getEdgeControl()
	{
	var v = getOption("EdgeControl")
	return ((v == "Off") ? 0 : ((v == "Maximum") ? 255 : 128))
	}

function getHalftone()
	{
	var v = getOption("Halftone")
	return ((v == "Detail") ? 1 : 0)
	}

function getRgbColor()
	{
	var v = getOption("RgbColor")
	if (v === "None") return 1;
	if (v === "Vivid") return 2;
	if (v === "Photo") return 3;
	if (v === "Photo(Adobe_RGB_1998)") return 4;
	return 0;
	//if (v === "Default_(sRGB)") return 1;
	}

function getPrintDepth()
	{
	var q = getOption("mvPrintQuality")
	return (q.toLowerCase() == "BestQuality".toLowerCase()) ? 2 : 1
	}

function getNotGrayscale()
	{
	var v = getOption("mvGrayscale")
	return ( (v == "true") ? false : true)
	}

function getPageBorder() {
    var v = getOption("page-border");
    if (v === "single") return 1;
    if (v === "single-thick") return 2;
    if (v === "double") return 3;
    if (v === "double-thick") return 4;
    return 0;
}

function getBooklet() {
	return getOption("mvBooklet") === "true";
}

function getSides() {
    var v;
	if (getBooklet()) return 2; // booklet is always short-edge
    v = getOption("sides");
    //if (v === "one-sided") return 0;
    if (v === "two-sided-short-edge") return 2;
    if (v === "two-sided-long-edge") return 1;
    return 0;
}

function getNumberUp() {
	if (getBooklet()) return 2; // booklet is always 2-up
	return parseInt(getOption("number-up") || "1", 10);
}

function getOutputOrder() {
    var v = getOption("OutputOrder");
    //if (v === "Normal") return 0;
    if (v === "Reverse") return 1;
    return 0;
}

function getDuplexing()
	{
	var  rc = 'OneSided'
	switch (getSides())
		{
		case 2:
			rc = 'TwoSidedShortEdge'
			break
		case 1:
			rc = 'TwoSidedLongEdge'
			break
		}
	return rc
	}

MRVL.print.ticket.job =
	{
	"JobNameText": getOption("com.apple.print.JobInfo.PMJobName"),
	"JobIdentifierText": getOption("job-uuid"),
	"JobCollate":getOption( "collate" ),
	"portName":"TBD-uri",
	"PageBorder":getPageBorder(),
	"Duplexing":getDuplexing()
	/* The following two are for C++ version of ZxRenderTarget
	,"isLittleEndian":false
	,"outputFile":"/tmp/FileDump.zjs"
	*/
	};

var nUp = getNumberUp();
var layout = getOption("number-up-layout"); // lrtb, tblr, rltb, tbrl
var booklet = getBooklet();
var duplex = getSides();
var collate = getOption("collate") === "true";
var pageSet = getOption("page-set"); // all, odd, even
var outputOrder = getOutputOrder();
var numCopies = parseInt(getOption("numCopies") || "1", 10);
var numOfPages = parseInt(getOption("numOfPages") || "0", 10);

function S(theSide) { return "S" + (100000 + theSide); }
function P(thePage) { return "P" + (10 + thePage); }
function O(theOffset) { return "O" + (10 + theOffset); }

function OneSide(pagelist, perside, JobSides, theSide, aSide) {
	var thePage, basePage, thisPage;
	JobSides[S(theSide)] = {};
	JobSides[S(theSide)].PageList = {};
	basePage = -1;
	for (thePage = 0; thePage < perside; thePage += 1) {
		thisPage = pagelist[aSide * perside + thePage];
		JobSides[S(theSide)].PageList[P(thePage)] = thisPage;
		if ((basePage === -1) || (basePage > thisPage)) {
			basePage = thisPage;
		}
	}
	if (cupsManualCopies || collate) {
		JobSides[S(theSide)].Log = "PAGE: " + (basePage + 1) + " 1\n";
	} else {
		JobSides[S(theSide)].Log = "PAGE: " + (basePage + 1) + " " + numCopies + "\n";
	}
	if (cupsManualCopies && !collate && numCopies > 1) {
		// repeat each side
		JobSides[S(theSide)].RepeatBegin = {};
		JobSides[S(theSide)].RepeatCount = numCopies - 1;
	}
}

function SimplexSides(pagelist, perside) {
    var JobSides = {};
    var theSide = -1;
    var sidelength = pagelist.length / perside;
    var aSide;
	// normal or reverse order?
	switch (outputOrder) {
	case 0: // Normal
		for (aSide = 0; aSide < sidelength; aSide += 1) {
			theSide += 1;
			OneSide(pagelist, perside, JobSides, theSide, aSide);
		}
		break;
	case 1: // Reverse
		for (aSide = sidelength - 1; aSide >= 0; aSide -= 1) {
			theSide += 1;
			OneSide(pagelist, perside, JobSides, theSide, aSide);
		}
		break;
	}
	// collated copies?
    if (collate && numCopies > 1) {
        // repeat the sequence
        JobSides[S(0)].RepeatBegin = {};
        JobSides[S(theSide)].RepeatCount = numCopies - 1;
    }
    return JobSides;
}

function DuplexSides(pagelist, perside) {
    var JobSides = {};
    var theSide = -1;
    var sidelength = pagelist.length / perside;
    var oddside = sidelength % 2;
    var iter, flipSide, bSide, aSide;
	var doASide = outputOrder == 1; // Reverse starts with A sides

	// two sides
	for (iter = 0; iter < 2; iter += 1) {
		flipSide = theSide + 1;
		if (doASide) {
			// A sides, starting at beginning
			for (aSide = 0; aSide < sidelength; aSide += 2) {
				theSide += 1;
				OneSide(pagelist, perside, JobSides, theSide, aSide);
			}

		} else {
			if (oddside) {
				// insert a blank side before the B sides
				theSide += 1;
				JobSides[S(theSide)] = {};
				JobSides[S(theSide)].Blank = 1;//(cupsManualCopies && !collate) ? numCopies : 1;
				if (cupsManualCopies || collate) {
					JobSides[S(theSide)].Log = "PAGE: 0 1\n";
				} else {
					JobSides[S(theSide)].Log = "PAGE: 0 " + numCopies + "\n";
				}
				if (cupsManualCopies && !collate && numCopies > 1) {
					// repeat the blank page
					JobSides[S(theSide)].RepeatBegin = {};
					JobSides[S(theSide)].RepeatCount = numCopies - 1;
				}
			}
			// B sides, starting at end
			for (bSide = oddside ? sidelength - 2 : sidelength - 1; bSide > 0; bSide -= 2) {
				theSide += 1;
				OneSide(pagelist, perside, JobSides, theSide, bSide);
				// spin the orientation of the B sides
				if (1 == duplex) { // only if long-edge
					fillPageWindow(JobSides[S(theSide)], true);
				}
			}
		}
			
		// repeat these sides (and the blank side)
		if (collate && numCopies > 1) {
			JobSides[S(flipSide)].RepeatBegin = {};
			JobSides[S(theSide)].RepeatCount = numCopies - 1;
		}

		// pause to flip paper
		if (iter === 0) {
			theSide += 1;
			JobSides[S(theSide)] = {};
			JobSides[S(theSide)].Pause = 1;
		}
		// do the other sides
		doASide = !doASide;
	}
    return JobSides;
}

function bookletlist() {
    var simplelist = [];
    var extraPages, numOfSides, pagemax, bookletpage, page0;
    if (numOfPages < 1) {
    } else if (numOfPages < 2) {
        simplelist.push(-1);
        simplelist.push(0);
    } else {
        extraPages = numOfPages % 4;
        if (extraPages !== 0) { extraPages = 4 - extraPages; }
        numOfSides = (numOfPages + extraPages) / 2;
        pagemax = numOfPages + extraPages - 1;
        for (bookletpage = 0; bookletpage < numOfSides; bookletpage += 2) {
            // booklet has funky page order
            page0 = pagemax - bookletpage;
			simplelist.push( page0 >= numOfPages ? -1 : page0 );
            page0 = bookletpage;
			simplelist.push( page0 >= numOfPages ? -1 : page0 );
            page0 = bookletpage + 1;
			simplelist.push( page0 >= numOfPages ? -1 : page0 );
            page0 = pagemax - bookletpage - 1;
			simplelist.push( page0 >= numOfPages ? -1 : page0 );
        }
    }
    return simplelist;
}

function pagelist(perside) {
    var simplelist = [];
    var simplepage, skippage, npage, page0;
	// skip even or odd sides?
	switch (pageSet) {
	default:
	//case "all":
		simplepage = 0;
		skippage = perside;
		break;
	case "odd":
		simplepage = 0;
		skippage = perside * 2;
		break;
	case "even":
		simplepage = perside;
		skippage = perside * 2;
		break;
	}
	// print pages in order
	for (; simplepage < numOfPages; simplepage += skippage) {
		for (npage = 0; npage < perside; npage += 1) {
			page0 = simplepage + npage;
			simplelist.push( page0 >= numOfPages ? -1 : page0 );
		}
    }
    return simplelist;
}

function fillJobSides(theticket) {
    var list = [];
    if (booklet) {
        list = bookletlist();
        if (list.length > 2) {
            theticket.JobSides = DuplexSides(list, 2);
        } else {
            theticket.JobSides = SimplexSides(list, 2);
        }
    } else {
        list = pagelist(nUp);
        if (duplex && list.length > nUp) {
            theticket.JobSides = DuplexSides(list, nUp);
        } else {
            theticket.JobSides = SimplexSides(list, nUp);
        }
    }
}

function fillPageOffset(theticket, xmeasure, xlayout, ymeasure, ylayout) {
    var page;
    theticket.PageOffsetX = {};
    theticket.PageOffsetY = {};
    for (theOffset = 0; theOffset < xlayout.length; theOffset += 1) {
        theticket.PageOffsetX[O(theOffset)] = xmeasure[xlayout[theOffset]];
        theticket.PageOffsetY[O(theOffset)] = ymeasure[ylayout[theOffset]];
    }
}

function fillPageWindow(theticket, spin) {
    var xsize = 72 * width;
    var ysize = 72 * height;
    var gutter = 3;
    var xscale, yscale;
    var dx = 72 * left;
    var dy = 72 * bottom;
    var xmeasure = [];
    var ymeasure = [];
    var xlayout = [];
    var ylayout = [];
	if (orienVal == 4 || orienVal == 6) { // 90 or 180
		spin = !spin;
	}
    switch (booklet ? 2 : nUp) {

    default:
    //case 1:
        theticket.PageRotation = spin ? 2 : 0;
		if (mirror) {
			theticket.PageRotation += 4;
		}
        theticket.PageScale = 1;
        theticket.PageSizeX = xsize;
        theticket.PageSizeY = ysize;
        theticket.PageOffsetX = dx;
        theticket.PageOffsetY = dy;
        return;

    case 2:
		if (xsize <= ysize) { // portrait
			theticket.PageRotation = spin ? 1 : 3;
			xscale = (ysize - gutter) / 2 / xsize;
			yscale = xsize / ysize;
			if (xscale <= yscale) {
				theticket.PageScale = xscale;
				dx += (xsize - ysize * xscale) / 2;
			} else {
				theticket.PageScale = yscale;
				dy += (ysize - (xsize * yscale * 2 + gutter)) / 4;
			}
			theticket.PageSizeX = ysize * theticket.PageScale;
			theticket.PageSizeY = xsize * theticket.PageScale;
			xmeasure = [ dx ];
			ymeasure = [ dy, (ysize + gutter) / 2 + dy ];
			switch (layout) {
			default:
			//case "lrtb":
			case "tblr":
				xlayout = [ 0, 0 ];
				ylayout = [ 1, 0 ];
				break;
			case "rltb":
			case "tbrl":
				xlayout = [ 0, 0 ];
				ylayout = [ 0, 1 ];
				break;
			}
		} else { // landscape
			theticket.PageRotation = spin ? 3 : 1;
			xscale = ysize / xsize;
			yscale = (xsize - gutter) / 2 / ysize;
			if (xscale <= yscale) {
				theticket.PageScale = xscale;
				dx += (xsize - (ysize * xscale * 2 + gutter)) / 4;
			} else {
				theticket.PageScale = yscale;
				dy += (ysize - xsize * yscale) / 2;
			}
			theticket.PageSizeX = ysize * theticket.PageScale;
			theticket.PageSizeY = xsize * theticket.PageScale;
			xmeasure = [ dx, (xsize + gutter) / 2 + dx ];
			ymeasure = [ dy ];
			xlayout = [ 0, 1 ];
			ylayout = [ 0, 0 ];
		}
        break;

    case 4:
        theticket.PageRotation = spin ? 2 : 0;
        xscale = (xsize - gutter) / 2 / xsize;
        yscale = (ysize - gutter) / 2 / ysize;
        if (xscale <= yscale) {
            theticket.PageScale = xscale;
            dy += (ysize - (ysize * xscale * 2 + gutter)) / 4;
        } else {
            theticket.PageScale = yscale;
            dx += (xsize - (xsize * yscale * 2 + gutter)) / 4;
        }
		theticket.PageSizeX = xsize * theticket.PageScale;
		theticket.PageSizeY = ysize * theticket.PageScale;
        xmeasure = [ dx, (xsize + gutter) / 2 + dx ];
        ymeasure = [ dy, (ysize + gutter) / 2 + dy ];
        switch (layout) {
        default:
        //case "lrtb":
            xlayout = [ 0, 1, 0, 1 ];
            ylayout = [ 1, 1, 0, 0 ];
            break;
        case "rltb":
            xlayout = [ 1, 0, 1, 0 ];
            ylayout = [ 1, 1, 0, 0 ];
            break;
        case "tblr":
            xlayout = [ 0, 0, 1, 1 ];
            ylayout = [ 1, 0, 1, 0 ];
            break;
        case "tbrl":
            xlayout = [ 1, 1, 0, 0 ];
            ylayout = [ 1, 0, 1, 0 ];
            break;
        }
        break;

    case 6:
		if (xsize <= ysize) { // portrait
			theticket.PageRotation = spin ? 1 : 3;
			xscale = (ysize - gutter * 2) / 3 / xsize;
			yscale = (xsize - gutter) / 2 / ysize;
			if (xscale <= yscale) {
				theticket.PageScale = xscale;
				dx += (xsize - (ysize * xscale * 2 + gutter)) / 4;
			} else {
				theticket.PageScale = yscale;
				dy += (ysize - (xsize * yscale * 3 + gutter * 2)) / 6;
			}
			theticket.PageSizeX = ysize * theticket.PageScale;
			theticket.PageSizeY = xsize * theticket.PageScale;
			xmeasure = [ dx, (xsize + gutter) / 2 + dx ];
			ymeasure = [ dy, (ysize + gutter) / 3 + dy, (ysize + gutter) * 2 / 3 + dy ];
			switch (layout) {
			default:
			//case "lrtb":
				xlayout = [ 1, 1, 1, 0, 0, 0 ];
				ylayout = [ 2, 1, 0, 2, 1, 0 ];
				break;
			case "rltb":
				xlayout = [ 1, 1, 1, 0, 0, 0 ];
				ylayout = [ 0, 1, 2, 0, 1, 2 ];
				break;
			case "tblr":
				xlayout = [ 1, 0, 1, 0, 1, 0 ];
				ylayout = [ 2, 2, 1, 1, 0, 0 ];
				break;
			case "tbrl":
				xlayout = [ 1, 0, 1, 0, 1, 0 ];
				ylayout = [ 0, 0, 1, 1, 2, 2 ];
				break;
			}
		} else { // landscape
			theticket.PageRotation = spin ? 3 : 1;
			xscale = (ysize - gutter) / 2 / xsize;
			yscale = (xsize - gutter * 2) / 3 / ysize;
			if (xscale <= yscale) {
				theticket.PageScale = xscale;
				dx += (xsize - (ysize * xscale * 3 + gutter * 2)) / 6;
			} else {
				theticket.PageScale = yscale;
				dy += (ysize - (xsize * yscale * 2 + gutter)) / 4;
			}
			theticket.PageSizeX = ysize * theticket.PageScale;
			theticket.PageSizeY = xsize * theticket.PageScale;
			xmeasure = [ dx, (xsize + gutter) / 3 + dx, (xsize + gutter) * 2 / 3 + dx ];
			ymeasure = [ dy, (ysize + gutter) / 2 + dy ];
			switch (layout) {
			default:
			//case "lrtb":
				xlayout = [ 0, 0, 1, 1, 2, 2 ];
				ylayout = [ 0, 1, 0, 1, 0, 1 ];
				break;
			case "rltb":
				xlayout = [ 0, 0, 1, 1, 2, 2 ];
				ylayout = [ 1, 0, 1, 0, 1, 0 ];
				break;
			case "tblr":
				xlayout = [ 0, 1, 2, 0, 1, 2 ];
				ylayout = [ 0, 0, 0, 1, 1, 1 ];
				break;
			case "tbrl":
				xlayout = [ 0, 1, 2, 0, 1, 2 ];
				ylayout = [ 1, 1, 1, 0, 0, 0 ];
				break;
			}
		}
		break;

    case 9:
        theticket.PageRotation = spin ? 2 : 0;
        xscale = (xsize - gutter * 2) / 3 / xsize;
        yscale = (ysize - gutter * 2) / 3 / ysize;
        if (xscale <= yscale) {
            theticket.PageScale = xscale;
            dy += (ysize - (ysize * xscale * 3 + gutter * 2)) / 6;
        } else {
            theticket.PageScale = yscale;
            dx += (xsize - (xsize * yscale * 3 + gutter * 2)) / 6;
        }
		theticket.PageSizeX = xsize * theticket.PageScale;
		theticket.PageSizeY = ysize * theticket.PageScale;
        xmeasure = [ dx, (xsize + gutter) / 3 + dx, (xsize + gutter) * 2 / 3 + dx ];
        ymeasure = [ dy, (ysize + gutter) / 3 + dy, (ysize + gutter) * 2 / 3 + dy ];
        switch (layout) {
        default:
        //case "lrtb":
            xlayout = [ 0, 1, 2, 0, 1, 2, 0, 1, 2 ];
            ylayout = [ 2, 2, 2, 1, 1, 1, 0, 0, 0 ];
            break;
        case "rltb":
            xlayout = [ 2, 1, 0, 2, 1, 0, 2, 1, 0 ];
            ylayout = [ 2, 2, 2, 1, 1, 1, 0, 0, 0 ];
            break;
        case "tblr":
            xlayout = [ 0, 0, 0, 1, 1, 1, 2, 2, 2 ];
            ylayout = [ 2, 1, 0, 2, 1, 0, 2, 1, 0 ];
            break;
        case "tbrl":
            xlayout = [ 2, 2, 2, 1, 1, 1, 0, 0, 0 ];
            ylayout = [ 2, 1, 0, 2, 1, 0, 2, 1, 0 ];
            break;
        }
        break;

    case 16:
        theticket.PageRotation = spin ? 2 : 0;
        xscale = (xsize - gutter * 3) / 4 / xsize;
        yscale = (ysize - gutter * 3) / 4 / ysize;
        if (xscale <= yscale) {
            theticket.PageScale = xscale;
            dy += (ysize - (ysize * xscale * 4 + gutter * 3)) / 8;
        } else {
            theticket.PageScale = yscale;
            dx += (xsize - (xsize * yscale * 4 + gutter * 3)) / 8;
        }
		theticket.PageSizeX = xsize * theticket.PageScale;
		theticket.PageSizeY = ysize * theticket.PageScale;
        xmeasure = [ dx, (xsize + gutter) / 4 + dx, (xsize + gutter) * 2 / 4 + dx, (xsize + gutter) * 3 / 4 + dx ];
        ymeasure = [ dy, (ysize + gutter) / 4 + dy, (ysize + gutter) * 2 / 4 + dy, (ysize + gutter) * 3 / 4 + dy ];
        switch (layout) {
        default:
        //case "lrtb":
            xlayout = [ 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3 ];
            ylayout = [ 3, 3, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 0, 0, 0, 0 ];
            break;
        case "rltb":
            xlayout = [ 3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0 ];
            ylayout = [ 3, 3, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 0, 0, 0, 0 ];
            break;
        case "tblr":
            xlayout = [ 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3 ];
            ylayout = [ 3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0 ];
            break;
        case "tbrl":
            xlayout = [ 3, 3, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 0, 0, 0, 0 ];
            ylayout = [ 3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0 ];
            break;
        }
        break;
    }

	if (mirror) {
		theticket.PageRotation += 4;
        xlayout.reverse();
	}
    if (spin) {
        xlayout.reverse();
        ylayout.reverse();
    }
    fillPageOffset(theticket, xmeasure, xlayout, ymeasure, ylayout);
}

fillJobSides(MRVL.print.ticket.job);
fillPageWindow(MRVL.print.ticket.job, false);

MRVL.print.ticket.page =
	{
	"PageOrientation":orien,
	"PageMediaSize":mediaName,
	"PageMediaType":mediaType,

	"PageImageableSize":
		{
		"ImageableSizeWidth":mediaWidth,
		"ImageableSizeHeight":mediaHeight,
		"ImageableArea":
			{
			"OriginWidth":left,
			"OriginHeight":top,
			"ExtentWidth":width,
			"ExtentHeight":height
			}
		},

	"PageResolution":
		{
		"ResolutionX":hdpi,
		"ResolutionY":vdpi
		},

	"Duplexing":getDuplexing(),
	"InputBin":getOption("mvSourceIs"),

	// --- keys should be PrintTicket schema (!) ---

	"collate": cupsManualCopies ? "true" : getOption( "collate" ),
	"copies": getOption("com.apple.print.PrintSettings.PMCopies..n."),

	// --- device specific ---

	"printColor":getNotGrayscale(),
	"renderColor":getNotGrayscale(),
	"printDepth":getPrintDepth(),

	"edgeControl":getEdgeControl(),
	"halftone":getHalftone(),
	"rgbColor":getRgbColor(),

	// "Netrual" sic in the PPD
	"textGray":getBlackMode("tNetrualGrays"),
	"graphicsGray":getBlackMode("gNetrualGrays"),
	"imageGray":getBlackMode("pNetrualGrays"),

	// --- renderer specific ---

	"isDisplay":true,
	"isColor":getNotGrayscale(),
	"bitsPerPixel":(getNotGrayscale() ? 32 : 8),
	"isFlipped": Flipped,
	"regionBits": RegionBits,

	"endOfTicket":0
	};
