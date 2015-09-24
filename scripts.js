function gid(x)	{
	return document.getElementById(x).value;
}
function write(ifrm, content)	{
	ifrm = (ifrm.contentWindow) ? ifrm.contentWindow : (ifrm.contentDocument.document) ? ifrm.contentDocument.document : ifrm.contentDocument;
	ifrm.document.open();
	ifrm.document.write(content);
	ifrm.document.close();
}
function run(z)	{
	var page = "<!DOCTYPE html>\n<html>\n<head>\n<title>"+gid('title')+"</title>\n<style>\nbody {\nbackground: "+gid('bg')+";\ncolor: "+gid('fg')+";\nfont-family: "+gid('ff')+";\n}\na {color: "+gid('l')+";}\na:visited {color: "+gid('vl')+";}\na:hover {color: "+gid('hl')+";}\na:active {color: "+gid('al')+";}\n"+gid('thecss')+"\n</style>\n<script>\n"+gid('thejs')+"\n</script>\n</head>\n<body>\n"+tinyMCE.get('thehtml').getContent()+"\n</body>\n</html>";
	if(z == 'y') {write(document.getElementById('dis'), page);}
	else {write(document.getElementById('thecode'), "<link href=\"prism.css\" rel=\"stylesheet\"><script src=\"prism.js\"></script><pre style=\"height: 100%;\"><code class=\"language-markup\"><xmp>"+page+"</xmp></code></pre>");}
}
