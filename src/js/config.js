// <script src="./lib/js/iChatClient.js"></script>
// <script src="./js/config.js"></script>

/*!
Math.uuid.js (v1.4)
http://www.broofa.com
mailto:robert@broofa.com

Copyright (c) 2010 Robert Kieffer
Dual licensed under the MIT and GPL licenses.
*/

/*
 * Generate a random uuid.
 *
 * USAGE: Math.uuid(length, radix)
 *   length - the desired number of characters
 *   radix  - the number of allowable values for each character.
 *
 * EXAMPLES:
 *   // No arguments  - returns RFC4122, version 4 ID
 *   >>> Math.uuid()
 *   "92329D39-6F5C-4520-ABFC-AAB64544E172"
 *
 *   // One argument - returns ID of the specified length
 *   >>> Math.uuid(15)     // 15 character ID (default base=62)
 *   "VcydxgltxrVZSTV"
 *
 *   // Two arguments - returns ID of the specified length, and radix. (Radix must be <= 62)
 *   >>> Math.uuid(8, 2)  // 8 character ID (base=2)
 *   "01001010"
 *   >>> Math.uuid(8, 10) // 8 character ID (base=10)
 *   "47473046"
 *   >>> Math.uuid(8, 16) // 8 character ID (base=16)
 *   "098F4D35"
 */
(function() {
  // Private array of chars to use
  var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

  Math.uuid = function (len, radix) {
    var chars = CHARS, uuid = [], i;
    radix = radix || chars.length;

    if (len) {
      // Compact form
      for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
    } else {
      // rfc4122, version 4 form
      var r;

      // rfc4122 requires these characters
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';

      // Fill in random data.  At i==19 set the high bits of clock sequence as
      // per rfc4122, sec. 4.1.5
      for (i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = 0 | Math.random()*16;
          uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
      }
    }

    return uuid.join('');
  };

  // A more performant, but slightly bulkier, RFC4122v4 solution.  We boost performance
  // by minimizing calls to random()
  Math.uuidFast = function() {
    var chars = CHARS, uuid = new Array(36), rnd=0, r;
    for (var i = 0; i < 36; i++) {
      if (i==8 || i==13 ||  i==18 || i==23) {
        uuid[i] = '-';
      } else if (i==14) {
        uuid[i] = '4';
      } else {
        if (rnd <= 0x02) rnd = 0x2000000 + (Math.random()*0x1000000)|0;
        r = rnd & 0xf;
        rnd = rnd >> 4;
        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
      }
    }
    return uuid.join('');
  };

  // A more compact, but less performant, RFC4122v4 solution:
  Math.uuidCompact = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  };
})();

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
// 例子： 
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}


window.ichat_config = {
	version: 'v0.1.0',
	debug:true,
	chat_server_url:'127.0.0.1:4567',
	// chat_server_url:'127.0.0.1:4567',
	chat_server_options:{
		url : 'http://at35.com:4567/faye',
		timeout : 120,
		retry		: 5
	},
	get_websql_db:function(){
		if(!window.openDatabase) {
			alert("Databases are not supported in this browser");
		}
			
		return openDatabase('db_ichat', '1.0', 'DB of im', 2 * 1024 * 1024); 
	},
	
	exec_sql:function(sql){
		var db = this.get_websql_db();
		
		this.log_sql(sql);
		
		db.transaction(function (tx) {	
			tx.executeSql(sql);
		},function(){
			alert('fail');
			return 0;
		},function(){
			// alert('succ');
			return 1;
		});
	},
	/** Select Row from Table **/ 
	exec_sql_with_result:function(query, cb){ // <-- extra param
	   var result = [];
		 var db = this.get_websql_db();
		 
 		 this.log_sql(query);
		 
	   db.transaction(function (tx) {
	      tx.executeSql(query, [], function(tx, rs){
	         for(var i=0; i<rs.rows.length; i++) {
	            var row = rs.rows.item(i)
	            result[i] = { id: row['id'],
	                          name: row['name']
	            }
	         }
	         console.log(result);
	         cb(result); // <-- new bit here
	      }, this.sql_error_handler);
	   });
	},
	sql_error_handler:function(){
		alert('sql 执行出错');
	},
	get_client:function(){
		return new iChatClient(this.chat_server_options);
	},
	get_chat_server_url : function(){
		return 'http://' + this.chat_server_url + '/faye'
	},
	api_server_url:'at35.com:5555',
	//api_server_url:'127.0.0.1:5555',
	get_api_server_url : function(){
		return 'http://' + this.api_server_url + '/api/' + this.version;
	},
	get_api_base_url : function(patten){
		return this.get_api_server_url()+ patten
	},
	/**
	 * 获取用户注册url
	 */
	get_api_user_register_url : function(){
		return this.get_api_base_url('/users/new')
	},
	/**
	 * 用户登陆
	 */
	get_api_user_login_url : function(){
		return this.get_api_base_url('/users/login')
	}
	,
	get_current_topic_with_session_id:function(current_session_id){
		return 'foo' + '_' + current_session_id;
	}
	//user
	,
	get_current_user: function(){
		return CURRENT_USER.get_current_user();	
	}	,
	get_current_session: function(){
		return CURRENT_SESSION.get_current_session();
	}	,
	get_user_sessions: function(){
		return USER_SESSION.get_user_sessions();
	},
	
	// messsage
	/**
	 * 1. 消息体本身（支持各种类型）
	 * 2. 用户信息
	 * 3. 会话信息
	 * 4. 时间
	 */
	get_msg: function(msg){
		var current_user = this.get_current_user();	
		var current_session = this.get_current_session();
		var user_sessions = this.get_user_sessions();
	
		var current_user_uid = current_user['_id'];
		var current_user_avatar = current_user['avatar'];

		var current_session_id = current_session['sid'];
		var current_session_name = current_session['name'];
		
		var _msg = msg;
		
		var message_id = Math.uuid();
		$.extend(_msg, {
			// 整合用户信息
			uid		: current_user_uid,
			avatar: current_user_avatar
		}, {
			// 整合会话信息
			sid 	: current_session_id,
			sname	: current_session_name
		},{
			mid: message_id,
			timestamp : new Date().Format("yyyy-MM-dd hh:mm:ss")
		});
		
		return _msg;
	},
	dump_message: function (msg){
		var content = '';
		for(var attr in msg){
			content += ' ' + attr + '=' + msg[attr];
		}
		this.log('收到的信息是：'+content);
	}
	
	//
	,log:function(t){
		if(this.debug){
			console.log('[LOG] '+ t);	
		}
	}
	
	,log_sql:function(t){
		if(this.debug){
			console.log('[SQL LOG] '+ t);	
		}
	}
}




Class('MessageBase',{
	config:function(){
		return ichat_config;
	},
	exec_sql:function(sql){
		this.config().exec_sql(sql);
	}
});
Class('Message', MessageBase, {
	constructor:function(mid, uid, avatar, sid, sname, timestamp, msg){
		this.mid = mid;
		this.uid = uid;
		this.avatar = avatar;
		this.sid = sid;
		this.sname= sname;
		this.timestamp = timestamp;
		this.msg = msg;
		
		this.create();
		
	},
	values:function(obj){
		Class('Dummy', obj);
		Dummy.call(this);
	},
	create:function(){
		var sql = 'CREATE TABLE IF NOT EXISTS message ('
			+'id INTEGER PRIMARY KEY AUTOINCREMENT,'
			+'mid string, '
			+'uid string, '
			+'avatar string,'
			+'sid string,'
			+'sname string,'
			+'timestamp string,'
			+'msg text)';
	
		this.exec_sql(sql);
	},
	save:function(){
		var sql = "insert into message ('mid','uid','avatar','sid','sname','timestamp','msg') values('"
				+ this.mid +"','" 
				+ this.uid +"','" 
				+ this.avatar + "','" 
				+ this.sid + "',' " 
				+ this.sname+"','"
				+ this.timestamp +"',' "
				+ this.msg 
			+ "')";
		
		ichat_config.exec_sql(sql);
	},
	to_string:function(){
		return  'object=('
				+ this.uid +',' 
				+ this.avatar + ',' 
				+ this.sid + ', ' 
				+ this.sname+','
				+ this.timestamp +', '
				+ this.msg 
			+ ')';
	}
});

Message.get_messages_with_current_session = function(cb){
	var config = ichat_config;
		
	var current_session = config.get_current_session();
	

	var current_session_id = current_session['sid'];
	var current_session_name = current_session['name'];
	
	var sql = "SELECT * FROM message where sid='" + current_session_id + "' and sname='" + current_session_name 
		+ "' order by timestamp;";
	config.log_sql(sql)
	config.exec_sql_with_result(sql, function(pleaseWork) {
    console.log(pleaseWork);
    // any further processing here
		cb(pleaseWork);
  });
	
}

Class('SessionLisner',MessageBase, {
	constructor:function(one_session){
		this.session = one_session;
		
		this.config = ichat_config;
		this.client = this.config.get_client();
		this.last_msg_id = undefined;
	},
	start_observe:function(){
		var current_session_id = this.session['sid'];
		var current_topic = this.config.get_current_topic_with_session_id(current_session_id);
	
		this.client.join(current_topic, function(message) {
		  // handle message
			
			if(this.last_msg_id != message.mid){
				console.log('收到的信息是：'+message.text);
				//TODO: 写到websql里
				this.save_message_to_web_sql(message);
				
				this.last_msg_id = message.mid;
			}else{
				console.log('收到的信息是重复的，丢弃');
			}
		});
	},
	save_message_to_web_sql:function(message){
		var msg = new Message();
		
		msg.mid = message.mid;
		msg.uid = message.uid;
		msg.avatar = message.avatar;
		msg.sid = message.sid;
		msg.sname= message.sname;
		msg.timestamp = message.timestamp;
		msg.msg = message.text;
		 
		
		msg.save();
	}
});

