<?php
	//header('Content-Type: text/html; charset=utf-8');
	header("Access-Control-Allow-Headers:Content-Type,Accept");
	//header("Access-Control-Allow-Origin: *");
	//header('Content-Type: application/json');
include_once "connect.php";

	
$res = [];


if (isset($mysql_error)){
     $res['error'] = $mysql_error;
    die(json_encode($res));
}
$params = json_decode(file_get_contents('php://input'));	

if (!isset($params) || !isset($params->user_id) || ($params->user_id == null)){
	$res['error'] = 'нет параметров';
	die(json_encode($res));
}


if (isset($params->comment) && ($params->comment != "")){

	$sql = "INSERT INTO `feedback` (`created`, `user_id`, `comment`)".
	" VALUES(now(), $params->user_id, '".mysqli_real_escape_string($mysqli, $params->email)." ; ".mysqli_real_escape_string($mysqli, $params->comment)."')";
	
	if ($mysqli->query($sql) === TRUE) {
		$res['comment_id'] = $mysqli->insert_id;
	} else {
		$res['error'] = 'Ошибка обращения к базе данных.';
	}

}else{
	$res['error'] = "Ошибка запроса, params: ".json_encode($params);
}

$mysqli->close();
echo json_encode($res);


?>