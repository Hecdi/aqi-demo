$(function(){
	$(".select2").select2({
        minimumResultsForSearch:-1
    });

    var obj = {};
    var chart1 = echarts.init(document.getElementById("main1"),'walden');
    var chart2 = echarts.init(document.getElementById("main2"),'walden');
    var chart3 = echarts.init(document.getElementById("main3"),'walden');
    setTimeout(function (){
        window.onresize = function(){
            chart1.resize();
            chart2.resize();
            chart3.resize();
        }
    },200);

    $.ajax({
    	url:'json/one.json',
    	type: 'get',
    	success: function(res){
            if(res){
            	obj = res;
            	bindSelect('.select11','.select12','.select13',chart1,obj);
            	bindSelect('.select21','.select22','.select23',chart2,obj);
            	bindSelect('.select31','.select32','.select33',chart3,obj);
            	$('.select11,.select21,.select31').trigger('change');
            }
    	},
    	error: function(e) {
    		console.log(e);
    	}
    })
})

//选项变动
function bindSelect(se1,se2,se3,main,obj){
	$(se1 +',' + se2 + ',' + se3).on('change',function(){
		var city = $(se1).val(),
		    time = $(se2).val(),
		    value = $(se3).val();
        var str = city + '按' +$(se2 + '\>option:selected').text() + '查询的' + $(se3 + '\>option:selected').text();
            $(this).parents('.box-header').next().find('.showInfo').html(str);
    	if(value == 'aqit'){
            option(less100(obj,city,time),main,value);
    	}

    	else if(value == 'aqip'){
            option(sort(obj,city,time),main,value);
    	}

    	else if(value == 'aqif'){
            option(maxValue(obj,city,time),main,value);
    	}
	})

}

//option配置
function option(arr,echart,time){
	var followMonth = ['一','二','三','四','五','六','七','八','九','十','十一','十二'],
	    followQuarterly = ['一','二','三','四'],
	    followWeek = [],
	    arrLength = arr.length,
        opxname = arrLength > 12 ? '周' : (arrLength > 4 ? '月' : '季度'),
        opyname = 'AQI' + (time == 'aqif' ? '峰值' : (time == 'aqip' ? '平均值' : '<100的天数'));

	    if(arrLength > 12){
	    	for (var i = 0; i < arrLength; i++) {
	    		followWeek.push(i +1);
	    	}
	    };

	var option = {
            tooltip: {
                trigger: 'axis',
                formatter: '第{b}'+ opxname + '<br/>'+ opyname +': {c}'

            },
            grid: {
                top:'8%',
                left: '6%',
                right: '7%',
                bottom: '6%',
                containLabel: true
            },
            toolbox: {
                feature: {
                    magicType:{
                        type:["line","bar"]                     
                    }
                }
            },
            xAxis: {
                type: 'category',
                boundaryGap: true,
                nameTextStyle: {
                    color: '#999'
                },
                axisTick:{
                    lineStyle:{
                        color:'#ddd'
                    },
                },
                axisLine:{
                    lineStyle:{
                        color:'#ddd'
                    }
                },
                axisLabel:{
                    textStyle:{
                        color:'#999'
                    }
                },
                data: arrLength > 12 ? followWeek : (arrLength > 4 ? followMonth : followQuarterly),
                name: opxname
            },
            yAxis: {
                type: 'value',
                nameTextStyle: {
                    color: '#999'
                },
                name: opyname,
                scale:true,
                axisLine:{
                    show:false,
                    lineStyle:{
                        color:'#ddd'
                    }
                },
                axisTick:{
                    show:false
                },
                axisLabel: {
                    show: true,
                    interval: 'auto',
                    /*formatter: isPer ? '{value} %': false*/
                }
            },
            series: [
	            {
	                name:'',
	                type:'line',
	                smooth:true,
	                symbol:'circle',
	                data: arr,
	                itemStyle:{
	                    normal:{
	                        lineStyle: {        // 系列级个性化折线样式
	                            width: 2,
	                            type: 'solid'
	                        }
	                    }
	                }
	            }
            ]
        };
        echart.clear();
        echart.setOption(option);
}

//算粒度平均值
function sort(arr,key1,time){
    var total = 0;
        averageValue_arr = [],
        length = arr.length,
        count = 0;
    if(time == 'week'){
    	count = (new Date(arr[0]['日期'])).getUTCDay();
    	var count2 = 0;
        $.each(arr,function(key,value){
	        total += parseInt(value[key1]);
	        count2++;
	        count++;
	        if(count >= 7){
	        	averageValue_arr.push((total/count2).toFixed(0));
	        	total = 0;
	        	count2 = 0;
	        	count = 0;
	        }

	        if(key >= (length - 1) && count2 > 0){
	        	averageValue_arr.push((total/count2).toFixed(0));
	        }
	    })
    }

    if(time == 'month'){
    	var countMonth = 0;
        $.each(arr,function(key,value){
	        if((new Date(value['日期']).getMonth() > countMonth)){
	        	countMonth = new Date(value['日期']).getMonth();
	        	averageValue_arr.push((total/count).toFixed(0));
	        	total = 0;
	        	count = 0;
	        }

	        if(key >= length - 1){
	        	total += parseInt(value[key1]);
	            count++;
	            averageValue_arr.push((total/count).toFixed(0));
	        }

	        total += parseInt(value[key1]);
	        count++;
	    })
    }

    if(time == 'quarterly'){
        $.each(arr,function(key,value){
        	var innerDate = new Date(value['日期']);
        	if((innerDate.getMonth() > 1) && ((innerDate.getMonth()) % 3 == 0) && (innerDate.getDate() == 1)){
	        	averageValue_arr.push((total/count).toFixed(0));
	        	total = 0;
	        	count = 0;
	        }
	        if(key >= (length - 1)){
	        	total += parseInt(value[key1]);
	            count++;
	            averageValue_arr.push((total/count).toFixed(0));
	        }
	        total += parseInt(value[key1]);
	        count++;
	    })
    }
    return averageValue_arr;
}

//算粒度最大值
function maxValue(arr,key1,time){
	var max = 0;
        maxValue_arr = [],
        length = arr.length,
        count = 0;
    if(time == 'week'){
    	count = (new Date(arr[0]['日期'])).getUTCDay();
        $.each(arr,function(key,value){
	        max = parseInt(value[key1]) > max ? parseInt(value[key1]) : max;
	        count++;
	        if(count >= 7){
	        	maxValue_arr.push(max.toFixed(0));
	        	max = 0;
	        	count = 0;
	        }
	        if(key >= (length - 1) && count > 0){
	        	maxValue_arr.push(max.toFixed(0));
	        }
	    })
    }

    if(time == 'month'){
    	var countMonth = 0;
        $.each(arr,function(key,value){
	        if((new Date(value['日期']).getMonth() > countMonth)){
	        	countMonth = new Date(value['日期']).getMonth();
	        	maxValue_arr.push(max.toFixed(0));
	        	max = 0;
	        	count = 0;
	        }

	        if(key >= length - 1){
	        	max = parseInt(value[key1]) > max ? parseInt(value[key1]) : max;
	            count++;
	            maxValue_arr.push(max.toFixed(0));
	        }

	        max = parseInt(value[key1]) > max ? parseInt(value[key1]) : max;
	        count++;
	    })
    }

    if(time == 'quarterly'){
        $.each(arr,function(key,value){
        	var innerDate = new Date(value['日期']);
        	if((innerDate.getMonth() > 1) && ((innerDate.getMonth()) % 3 == 0) && (innerDate.getDate() == 1)){
	        	maxValue_arr.push(max.toFixed(0));
	        	max = 0;
	        	count = 0;
	        }
	        if(key >= (length - 1)){
	        	max = parseInt(value[key1]) > max ? parseInt(value[key1]) : max;
	            count++;
	            maxValue_arr.push(max.toFixed(0));
	        }
	        max = parseInt(value[key1]) > max ? parseInt(value[key1]) : max;
	        count++;
	    })
    }
    return maxValue_arr;
}

//算粒度小于100的天数
function less100(arr,key1,time){
    var total = 0;
        averageValue_arr = [],
        length = arr.length,
        count = 0;
    if(time == 'week'){
    	count = (new Date(arr[0]['日期'])).getUTCDay();
        $.each(arr,function(key,value){
	        total += parseInt(value[key1]) < 100 ? 1 : 0;
	        count++;
	        if(count >= 7){
	        	averageValue_arr.push(total.toFixed(0));
	        	total = 0;
	        	count = 0;
	        }

	        if(key >= (length - 1) && count > 0){
	        	averageValue_arr.push((total).toFixed(0));
	        }
	    })
    }

    if(time == 'month'){
    	var countMonth = 0;
        $.each(arr,function(key,value){
	        if((new Date(value['日期']).getMonth() > countMonth)){
	        	countMonth = new Date(value['日期']).getMonth();
	        	averageValue_arr.push((total).toFixed(0));
	        	total = 0;
	        	count = 0;
	        }

	        if(key >= length - 1){
	        	total += parseInt(value[key1]) < 100 ? 1 : 0;
	            count++;
	            averageValue_arr.push((total).toFixed(0));
	        }

	        total += parseInt(value[key1]) < 100 ? 1 : 0;
	        count++;
	    })
    }

    if(time == 'quarterly'){
        $.each(arr,function(key,value){
        	var innerDate = new Date(value['日期']);
        	if((innerDate.getMonth() > 1) && ((innerDate.getMonth()) % 3 == 0) && (innerDate.getDate() == 1)){
	        	averageValue_arr.push((total).toFixed(0));
	        	total = 0;
	        	count = 0;
	        }
	        if(key >= (length - 1)){
	        	total += parseInt(value[key1]) < 100 ? 1 : 0;
	            count++;
	            averageValue_arr.push((total).toFixed(0));
	        }
	        total += parseInt(value[key1]) < 100 ? 1 : 0;
	        count++;
	    })
    }
    return averageValue_arr;
}