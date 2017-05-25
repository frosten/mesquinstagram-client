$(document).ready(function(){

	$('.tooltipped').tooltip({delay: 50});
	loadPhotos();

	function loadPhotos(){
		var xhr = new XMLHttpRequest();

		xhr.open('GET', 'http://localhost:3000/api/posts');
		
		xhr.send();

		xhr.onload = function(){

			if(xhr.status === 200){

				var data = $.parseJSON(xhr.responseText);
				var loggedUserId = $('#loggedUserId').val();

				$('#sectionTimeline').html('');
				$('#divCreditsFelipe').show();

				for(var i=0; i < data.length; i++){

					var html = '';
					var liked = false;

					if(data[i].users_liked !== undefined){

						for(var j=0; j < data[i].users_liked.length; j++){
							if(loggedUserId == data[i].users_liked[j].user_id)
								liked = true;
						}
					}

					html += '<div class="row">';
						html += '<div class="col s12 m6 offset-m3">';
							html += '<div class="card">';

								html += '<div class="card-content card-photo-header valign-wrapper">';
									html += '<img class="avatar-rounded" src="images/avatars/'+data[i].author_avatar+'.jpg"> ';
									html += '<span class="valign">'+data[i].author+'</span>';
								html += '</div>';

								html += '<div class="card-image">';
									html += '<img src="https://s3.amazonaws.com/mesquinstagram/'+data[i].img_url+'" >';
								html += '</div>';

								html += '<div class="card-content">';

									html += '<div class="div-likes valign-wrapper">';

										// User is not logged
										if(typeof loggedUserId != 'undefined'){
											if(liked)
												html += '<i class="material-icons cursor-pointer icon-dislike">favorite</i>';
											else
												html += '<i class="material-icons cursor-pointer icon-like">favorite_border</i> ';
										}
										else{
											html += '<i class="material-icons cursor-pointer show-modal-login">favorite_border</i> ';
										}
										
										if(parseInt(data[i].likes) > 1)
											html += '<span class="num-likes">'+data[i].likes+'</span> <span class="txt-likes">Likes</span>';
										else
											html += '<span class="num-likes">'+data[i].likes+'</span> <span class="txt-likes">Like</span>';

									html += '</div>';

									html += '<p>';
										html += data[i].title;
									html += '</p>';
								html += '</div>';

								html += '<div class="card-action">';
									html += '<div class="input-field div-input-comment">';
										html += '<input id="comment_'+data[i]._id+'" type="text" class="input-comment validate">';
										html += '<label for="comment_'+data[i]._id+'" class="">Say something about this...</label>';
									html += '</div>';

									html += '<div class="hide div-btn-comment">';
										html += '<a class="btn-comment waves-effect waves-light btn" value = "'+data[i]._id+'">Submit</a>';
									html += '</div>';

									html += '<div class="div-comments">';
										if(data[i].comments !== undefined){
											for(var j=0; j < data[i].comments.length; j++){
												html += '<div class="div-single-comment">';
													html += '<span class = "comment-author">'+data[i].comments[j].author+': </span>';
													html += '<span class="comment-content">'+data[i]. $('<p/>').html(comments[j].comment).text()+'</span>';
												html += '</div>';
											}
										}
									html += '</div>';

								html += '</div>';
							html += '</div>';
						html += '</div>';
					html += '</div>';

					$('#sectionTimeline').append(html);
				}
			}
		};
	}

	$(document).on('click', '.icon-like, .icon-dislike', function(){

		var postId = $(this).parent().parent().next().children('.div-btn-comment').children().attr('value');				
		var parent = $(this).parent();
		
		var numLikesElem = $(this).parent().children('.num-likes');
		var numLikes = parseInt($(numLikesElem).html());
		var txtLikesElem = $(this).parent().children('.txt-likes');
		var html = '';
		if($(this).hasClass('icon-like')){
			numLikes++;
			html = '<i class="material-icons cursor-pointer icon-dislike">favorite</i>';
		}
		else{
			numLikes--;
			html = '<i class="material-icons cursor-pointer icon-like">favorite_border</i>';
		}

		$(this).remove();
		$(parent).prepend(html);

		$(numLikesElem).html(numLikes);

		if(numLikes > 1)
			$(txtLikesElem).html('Likes');
		else
			$(txtLikesElem).html('Like');

		var _user_id = $('#loggedUserId').val();

		var xhr = new XMLHttpRequest();

		if($(this).hasClass('icon-like'))
			xhr.open('PUT', 'http://localhost:3000/api/post/'+postId+'/like');
		else
			xhr.open('PUT', 'http://localhost:3000/api/post/'+postId+'/dislike');


		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify({user_id: _user_id}));

	});

	$(document).on('click', '.btn-comment', function(){

		var user = $('#loggedUserName').val();

		//User is not logged
		if(typeof user == 'undefined'){
			$('#modalLogin').modal();
			$('#modalLogin').modal('open');
			return;
		}

		var id = $(this).attr('value');
		var elem = this;
		var idInputComment = 'comment_'+id;
		var _comment = $('#'+idInputComment).val();

		var xhr = new XMLHttpRequest();
		xhr.open('PUT', 'http://localhost:3000/api/post/'+id+'/comment');
		xhr.setRequestHeader('Content-Type', 'application/json');

		xhr.send(JSON.stringify({comment: _comment, author: user}));

		xhr.onload = function(){
			if(xhr.status === 200){
				var response = $.parseJSON(xhr.responseText);

				var html = '';
				html += '<div class="div-single-comment">';
					html += '<span class = "comment-author">'+user+': </span>';
					html += '<span class="comment-content">'+_comment+'</span>';
				html += '</div>';

				$(elem).parent().next().append(html);
				$('#'+idInputComment).val('');
			}
		};

	});
	$(document).on('keydown', '.input-comment, #photoDescription', function(e){
	    if(e.which == 13){

	    	if($(this).hasClass('input-comment')){
	    		$(this).parent().next().children('.btn-comment').trigger("click");
	    	}
	    	else if($(this).attr('id') == 'photoDescription'){
				$(this).parent().next().trigger("click");
	    	}

	    }
	});
	$(document).on('click', '#iconLogOut', function(){
		$(this).parent().next().trigger("click");
	});

	$(document).on('click', '.show-modal-login', function(){
		$('#modalLogin').modal();
		$('#modalLogin').modal('open');
	});

	$('.show-publish-div').click(function(){
		$('#sectionTimeline').hide();
		$('#sectionPublishPhoto').show();
	});

	$('#btnCancel, #logo-container').click(function(){
		$('#sectionTimeline').show();
		$('#sectionPublishPhoto').hide();
	});

	//Publish a new photo
	$('#btnPublish').click(function(){

		//Create our formData
		var formData = new FormData();
		var file = document.getElementById('file').files[0];
		var title = document.getElementById('photoDescription').value;
		var user = $('#loggedUserName').val();
		var avatar = $('#loggedUserAvatar').val();

		formData.append('file', file);
		formData.append('title', title);
		formData.append('user', user);
		formData.append('avatar', avatar);

		var xhr = new XMLHttpRequest();

		//Issue the request
		xhr.open('POST', 'http://localhost:3000/api/post');
		xhr.send(formData);

		xhr.onload = function(){

			if(xhr.status === 200){
				var response = $.parseJSON(xhr.responseText);
				uploadFile(file, response.signedRequest, response.fileName);
			}
			else if(xhr.status === 400){
				$('#modalErrorFileExtension').modal();
				$('#modalErrorFileExtension').modal('open');
			}
			else{
				$('#modalErrorGeneric').modal();
				$('#modalErrorGeneric').modal('open');
			}

		};

	});

	function uploadFile(file, signedRequest, fileName){
		var xhr = new XMLHttpRequest();
		xhr.open('PUT', signedRequest);

		xhr.onreadystatechange = () => {
			if(xhr.readyState === 4){
				if(xhr.status === 200){
					savePost(fileName);
				}
				else{
					$('#modalErrorGeneric').modal();
					$('#modalErrorGeneric').modal('open');
				}
			}
		};

		xhr.send(file);
	}

	function savePost(fileName){
		var xhr = new XMLHttpRequest();

		//Create our formData
		var formData = new FormData();
		var title = document.getElementById('photoDescription').value;
		var user = $('#loggedUserName').val();
		var avatar = $('#loggedUserAvatar').val();

		formData.append('title', title);
		formData.append('user', user);
		formData.append('avatar', avatar);
		formData.append('fileName', fileName);

		//Issue the request
		xhr.open('POST', 'http://localhost:3000/api/post/save');
		xhr.send(formData);

		xhr.onload = function(){

			if(xhr.status === 200){
				window.location.href = '/home';
			}
			else{
				$('#modalErrorGeneric').modal();
				$('#modalErrorGeneric').modal('open');
			}

		};
	}


	

});
