// 转换时间戳, 会返回一个对象
function getTimeStamp(timeString) {
	if (typeof timeString !== 'string') {
		return {
			error: true,
			time: +new Date(timeString),
			timeString: timeString
		};
	}
	var date = new Date(0);
	var stamps = [];
	var company = undefined;
	var O = 86400000;
	var Y = '年';
	var Q = '季';
	var M = '月';
	var W = '周';
	var D = '日';

	stamps.push({
		index: timeString.indexOf(Y),
		name: Y
	}, {
		index: timeString.indexOf(Q),
		name: Q
	}, {
		index: timeString.indexOf(M),
		name: M 
	}, {
		index: timeString.indexOf(W),
		name: W
	}, {
		index: timeString.indexOf(D),
		name: D  
	});
	
	// 寻找最大度量单位
	for(var i = 0, j = stamps.length; i < j; i ++) {
		if (stamps[i].index !== -1) {
			company = stamps[i].name;
			break;
		}
	}

	if (!company) return {
		error: true,
		time: +new Date(timeString),
		timeString: timeString
	};

	// 排序
	stamps.sort(function(stampa, stampb) {
		return stampa.index - stampb.index;
	});

	// 取值
	var newTime = timeString;
	stamps.forEach(function(data) {
		if (data.index !== -1) {
			var time = newTime.split(data.name);
			switch (data.name) {
				case Y:
					date.setYear(Number(time[0]));
					break;
				case Q:
					date.setMonth(Number(time[0]) * 3 - 2);
					break;
				case M:
					date.setMonth(Number(time[0]) - 1);
					break;
				case W:
					date = new Date(+ date + 7 * time[0] * O);
					break;
				case D:
					date = new Date(+ date + time[0] * O);
					break;
			}
			newTime = time[1];
		}
	});
	return {
		time: (+ date),
		company: company,
		date: date,
		timeString: timeString
	};
}