/**
 * @param {String} formatStr 关键词：YYYY(年份),MM(月份),DD(天),H(小时),M(分钟),S(秒数)
 */
Date.prototype.format = function (formatStr) {
	const date = new Date(this);
	formatStr = formatStr.toUpperCase();
	if (formatStr.indexOf("YYYY") > -1) {
		formatStr = formatStr.replace("YYYY", date.getFullYear());
	}
	["MM", "DD", "H", "M", "S"].forEach( e=> {
		if (formatStr.indexOf(e) === -1) {
			return;
		}
		let value = "";
		switch (e) {
		case "MM":
			value = "" + (date.getMonth()+1);
			break;
		case "DD":
			value = "" +  date.getDate();
			break;
		case "H":
			value = "" +  date.getHours();
			break;
		case "M":
			value = "" +  date.getMinutes();
			break;
		case "S":
			value = "" +  date.getSeconds();
			break;
		default:
			break;
		}
		const valueStr = "00" + value;
		formatStr = formatStr.replace(e, valueStr.substr(valueStr.length - 2));
	});
	return formatStr;
};