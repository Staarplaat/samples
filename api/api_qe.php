<?php
	//header('Content-Type: text/html; charset=utf-8');
	header("Access-Control-Allow-Headers:Content-Type,Accept");
	//header("Access-Control-Allow-Origin: *");
	//header('Content-Type: application/json');
    header('Content-Type: application/json; charset=utf-8');
include_once "connect.php";

	
$res = [];


if (isset($mysql_error)){
     $res['error'] = $mysql_error;
    die(json_encode($res));
}
$params = json_decode(file_get_contents('php://input'));	

if (!isset($params) || !isset($params->method) || ($params->method == null) || !isset($params->user_id) || ($params->user_id == null)){
	$res['error'] = 'нет параметров';
	die(json_encode($res));
}

function getWaitingcount($user_id,$mysqli, &$res ){
	//$query = "SELECT params FROM `status` WHERE status=0 AND id<(SELECT id FROM `status` WHERE status=0 AND user_id=$user_id ORDER BY id ASC LIMIT 1)";

	// Filter banned users
	$query = "SELECT params FROM `status_for_edit_image` LEFT JOIN users ON users.id=status_for_edit_image.user_id WHERE status_for_edit_image.status=0 AND users.banned=0 AND status_for_edit_image.id<(SELECT id FROM `status_for_edit_image` WHERE status=0 AND user_id=$user_id ORDER BY id ASC LIMIT 1)";

	if ($result = $mysqli->query($query)) {
		$res['waitingcount'] = 0;
		while ($row = $result->fetch_assoc()) {
    		$params = json_decode($row['params']);
			$res['waitingcount'] = $res['waitingcount'] + intval($params->batch_size) * intval($params->iterations);
    	}
	} else {
		$res['error'] = 'getWaitingcount: error request waitingcount'.$mysqli->error;
		die(json_encode($res));
	}
}

/* function getWaitingcount($user_id,$mysqli, &$res ){
	$query = "SELECT COUNT(id) as waitingcount FROM `status` WHERE status=0 AND id<(SELECT id FROM `status` WHERE status=0 AND user_id=$user_id ORDER BY id ASC LIMIT 1)";
	if ($result = $mysqli->query($query)) {
		if ($row = $result->fetch_assoc()) {
			$res['waitingcount'] = intval($row['waitingcount']);
		}
		$records = [];
		while ($row = $result->fetch_assoc()) {
    		$res['images'][] = $row;
    	}
	} else {
		$res['error'] = 'getWaitingcount: error request waitingcount'.$mysqli->error;
		die(json_encode($res));
	}
} */

function getUserWaitingParams($user_id,$mysqli, &$res ){
	$query = "SELECT params FROM `status_for_edit_image` WHERE status=0 AND user_id=$user_id ORDER BY id ASC LIMIT 1";
	if ($result = $mysqli->query($query)) {
        // die(json_encode($result->fetch_assoc()));
		if ($row = $result->fetch_assoc()) {
			return json_encode($row);
		} else {
			// $res['error'] = 'getUserWaitingParams: error request 1'.$mysqli->error;
			// die(json_encode($res));
            return json_encode(0);
		}
	} else {
		$res['error'] = 'getUserWaitingParams: error request 2'.$mysqli->error;
		die(json_encode($res));
	}
}

function checkUserWaiting($user_id,$mysqli, &$res ){
	$query = "SELECT COUNT(id) as userwaitingcount FROM `status_for_edit_image` WHERE status=0 AND user_id=$user_id";
	if ($result = $mysqli->query($query)) {
		if ($row = $result->fetch_assoc()) {
			if (intval($row['userwaitingcount']) > 0){
				return true;
			}
			return false;
		} else {
			$res['error'] = 'checkUserWaiting: error request 1'.$mysqli->error;
			die(json_encode($res));
		}
	} else {
		$res['error'] = 'checkUserWaiting: error request 2'.$mysqli->error;
		die(json_encode($res));
	}
}

function listZakazyMy($user_id, $type, $mysqli, &$res ){
	if ($type == "transformer"){
		$query = "SELECT * FROM `gotovo` WHERE user_id='$user_id' AND deleted=0 AND input_image!='' AND type=0 ORDER BY id ASC  ";
	} else if ($type == "instantid") {
		$query = "SELECT * FROM `gotovo` WHERE user_id='$user_id' AND deleted=0 AND type=2 ORDER BY id ASC  ";
    } else if ($type == "qe") {
		$query = "SELECT * FROM `gotovo` WHERE user_id='$user_id' AND deleted=0 AND type=3 ORDER BY id DESC  ";
	} else {
		$query = "SELECT * FROM `gotovo` WHERE user_id='$user_id' AND deleted=0 AND input_image='' AND type=0 ORDER BY id ASC  ";
	}
	if ($result = $mysqli->query($query)) {
		$res['images'] = [];
		//$res['user_id'] = $token->id;
		while ($row = $result->fetch_assoc()) {
    		/* выборка данных и помещение их в массив */	
    		$res['images'][] = $row;
    	}
    }else{
    	$res['error'] = 'listZakazyMy: error request gotovo'.$mysqli->error;
		die(json_encode($res));
    }
    //$res['servertime'] = time();
    //$res['servertimezone'] = date_default_timezone_get();
}

function listZakazyAll($user_id, $type, $mysqli, &$res ){
	if ($type == "transformer"){
		$query = "SELECT * FROM `gotovo` WHERE common=1 AND input_image!='' AND type!=2 ORDER BY id DESC  ";
	} else if ($type == "instantid"){
		$query = "SELECT * FROM `gotovo` WHERE common=1 AND type=2 ORDER BY id DESC  ";
	} else {
		$query = "SELECT * FROM `gotovo` WHERE common=1 AND input_image='' ORDER BY id DESC  ";
	}
	if ($result = $mysqli->query($query)) {
		$res['images'] = [];
		//$res['user_id'] = $token->id;
		while ($row = $result->fetch_assoc()) {
    		/* выборка данных и помещение их в массив */	
    		$res['images'][] = $row;
    	}
    }else{
    	$res['error'] = 'listZakazyAll: error request gotovo'.$mysqli->error;
		die(json_encode($res));
    }
    //$res['servertime'] = time();
    //$res['servertimezone'] = date_default_timezone_get();
}

function listZakazyBest($user_id, $type, $mysqli, &$res ){

	$query = "SELECT * FROM `gotovo` WHERE best=1 AND type=3 ORDER BY created ASC  ";
	
	if ($result = $mysqli->query($query)) {
		$res['images'] = [];
		//$res['user_id'] = $token->id;
		while ($row = $result->fetch_assoc()) {
    		/* выборка данных и помещение их в массив */	
    		$res['images'][] = $row;
    	}
    }else{
    	$res['error'] = 'listZakazyBest: error request gotovo'.$mysqli->error;
		die(json_encode($res));
    }
    //$res['servertime'] = time();
    //$res['servertimezone'] = date_default_timezone_get();
}

function removeImage($user_id, $image_id ,$mysqli,&$res){
	$sql = "UPDATE `gotovo` set deleted=1 WHERE id='$image_id' AND user_id='$user_id'";
	if ($mysqli->query($sql) === TRUE) {
		return true;
	} else {
	    $res['error'] = 'removeImage: Error when update deleted records';
	}
	return false;
}

if (($params->method == 'removeImage') && (isset($params->image_id)) ){
	$remove = removeImage($params->user_id, $params->image_id, $mysqli, $res);
	if ($remove){
		$res['removed']=1;
	} else {
	    $res['error'] = 'removeImage: Request error 1';
	}
}else{
	if ($params->method == 'removeImage'){
		$res['error'] = "removeImage: Request error 2";
	}
}

if (($params->method == 'removeImageAdmin') && (isset($params->image_id)) ){
	$sql = "UPDATE `gotovo` set deletedbyadmin=1 WHERE id='$params->image_id'";
	if ($mysqli->query($sql) === TRUE) {
		$res['removed']=1;
	} else {
	    $res['error'] = 'removeImageAdmin: Error when update deleted records';
	}
}else{
	if ($params->method == 'removeImageAdmin'){
		$res['error'] = "removeImageAdmin: Request error 2";
	}
}

if (($params->method == 'addtocommon') && (isset($params->image_id)) ){
	$sql = "UPDATE `gotovo` set common=1 WHERE id='$params->image_id'";
	if ($mysqli->query($sql) === TRUE) {
		$res['common']=1;
	} else {
	    $res['error'] = 'addtocommon: Error when update records';
	}
}else{
	if ($params->method == 'addtocommon'){
		$res['error'] = "addtocommon: Request error";
	}
}

if (($params->method == 'addtobest') && (isset($params->image_id)) ){
	$sql = "UPDATE `gotovo` set best=1 WHERE id='$params->image_id'";
	if ($mysqli->query($sql) === TRUE) {
		$res['best']=1;
	} else {
	    $res['error'] = 'addtobest: Error when update records';
	}
}else{
	if ($params->method == 'addtobest'){
		$res['error'] = "addtobest: Request error";
	}
}

if ($params->method == 'getVSEKARTINKI_COUNT_Admin'){
	$type = "";
	if (isset($params->type)){
		$type = $params->type;
	}
	if ($type == "transformer"){
		$query = "SELECT MAX(id) as max_id, COUNT(id) as total FROM gotovo WHERE input_image!='' AND type!=2 AND deleted=0 AND deletedbyadmin=0 ORDER BY id DESC";
	} else if ($type == "instantid"){
		$query = "SELECT MAX(id) as max_id, COUNT(id) as total FROM gotovo WHERE input_image!='' AND type=2 AND deletedbyadmin=0 ORDER BY id DESC";
	} else {
		$query = "SELECT MAX(id) as max_id, COUNT(id) as total FROM gotovo WHERE input_image='' AND deleted=0 AND deletedbyadmin=0 ORDER BY id DESC";
	}
	if ($result = $mysqli->query($query)) {
		$row = $result->fetch_assoc();
		$res['max_id'] = $row["max_id"];
		$res['total'] = $row["total"];
	}else{
		$res['error'] = 'getVSEKARTINKI_COUNT_Admin: error request'.$mysqli->error;
		die(json_encode($res));
	}
}

if ($params->method == 'getVSEKARTINKIAdmin'){
	$type = "";
	if (isset($params->type)){
		$type = $params->type;
	}
	if ($type == "transformer"){
		//$query = "SELECT * FROM `gotovo` WHERE id <= $params->max_id AND input_image!='' AND deleted=0 AND deletedbyadmin=0 ORDER BY id DESC LIMIT $params->limit, $params->portionsize";
		$query = "SELECT * FROM `gotovo` WHERE id <= $params->max_id AND input_image!='' AND type!=2 AND deletedbyadmin=0 ORDER BY id DESC LIMIT $params->limit, $params->portionsize";
	} else if ($type == "instantid"){
		//$query = "SELECT * FROM `gotovo` WHERE id <= $params->max_id AND input_image!='' AND deleted=0 AND deletedbyadmin=0 ORDER BY id DESC LIMIT $params->limit, $params->portionsize";
		$query = "SELECT * FROM `gotovo` WHERE id <= $params->max_id AND input_image!='' AND type=2 AND deletedbyadmin=0 ORDER BY id DESC LIMIT $params->limit, $params->portionsize";
	} else {
		//$query = "SELECT * FROM `gotovo` WHERE id <= $params->max_id AND input_image='' AND deleted=0 AND deletedbyadmin=0 ORDER BY id DESC LIMIT $params->limit, $params->portionsize";
		$query = "SELECT * FROM `gotovo` WHERE id <= $params->max_id AND input_image='' AND deletedbyadmin=0 ORDER BY id DESC LIMIT $params->limit, $params->portionsize";
	}
	if ($result = $mysqli->query($query)) {
		$res['images'] = [];
		while ($row = $result->fetch_assoc()) {
			$res['images'][] = $row;
		}
	}else{
		$res['error'] = 'getVSEKARTINKIAdmin: error request gotovo'.$mysqli->error;
		die(json_encode($res));
	}
	$res['userwaiting'] = checkUserWaiting($params->user_id,$mysqli, $res );
	getWaitingcount($params->user_id,$mysqli, $res );
	$res['userwaitingparams'] = getUserWaitingParams($params->user_id,$mysqli, $res );
}

if ($params->method == 'getMy'){
	$type = "";
	if (isset($params->type)){
		$type = $params->type;
	}
	listZakazyMy($params->user_id, $type, $mysqli, $res);
	$res['userwaiting'] = checkUserWaiting($params->user_id,$mysqli, $res );
	getWaitingcount($params->user_id,$mysqli, $res );
	$res['userwaitingparams'] = getUserWaitingParams($params->user_id,$mysqli, $res );
}

if ($params->method == 'getSaves'){
    $savefolders = glob('../saves/'.$params->user_id.'/*', GLOB_ONLYDIR);
    $res['saves'] = [];
    for ($i = 0; $i < count($savefolders); $i++) {
        // $f = $savefolders[$i]."/m_preview.jpeg";
        // $res['saves'][] = $f;
        if (file_exists($savefolders[$i]."/m_preview.jpeg")){
            $res['saves'][] = basename($savefolders[$i]);
        }
    }
}
if ($params->method == 'getSavesAdmin'){
    $saveusers = array_map('basename', glob('../saves/*', GLOB_ONLYDIR));
    $res['saves'] = [];
    for ($u = 0; $u < count($saveusers); $u++) {
        $savefolders = glob('../saves/'.$saveusers[$u].'/*', GLOB_ONLYDIR);
        
        for ($i = 0; $i < count($savefolders); $i++) {
            // $f = $savefolders[$i]."/m_preview.jpeg";
            // $res['saves'][] = $f;
            if (file_exists($savefolders[$i]."/m_preview.jpeg")){
                $res['saves'][] = $saveusers[$u]."/".basename($savefolders[$i]);
            }
        }
    }
}
if ($params->method == 'getSavesPrimery'){
    $query = "SELECT * FROM `saves_primery` ";
    $res['saves'] = [];
	if ($result = $mysqli->query($query)) {
		while ($row = $result->fetch_assoc()) {
			$res['saves'][] = $row;
		}
	}else{
		$res['error'] = 'getSavesPrimery: error request'.$mysqli->error;
		die(json_encode($res));
	}
}
if ($params->method == 'setSavesAsPrimer'){
    $sql = "INSERT INTO `saves_primery` (`folder`, `file`)".
                                " VALUES( '".mysqli_real_escape_string($mysqli, $params->savefolder)."', '".mysqli_real_escape_string($mysqli, $params->savefile)."' )";
    if ($mysqli->query($sql) === TRUE) {
        $res['save_id'] = $mysqli->insert_id;
    } else {
        $res['error'] = 'setSavesAsPrimer error';
        die(json_encode($res));
    }
}
if ($params->method == 'copySavesPrimer'){
    $user_id = $params->user_id; 
    $maketname = $params->maketname;
    $relativepath = $params->relativepath;
    $maketworkingdir = $params->maketworkingdir;
    $fromfolder = $relativepath.$params->saveprimeruser."/".$params->saveprimerfolder;
    $tofolder = $relativepath.$user_id."/".$maketworkingdir;
    if (!file_exists($relativepath.$user_id)) {
        mkdir($relativepath.$user_id, 0777, true);
    }
    custom_copy($fromfolder, $tofolder);
    if (file_exists($tofolder)) {
        $res['res'] = 'OK';
        $res['maketname'] = $maketname;
    } else {
        $res['error'] = 'copySavesPrimer error';
        die(json_encode($res));
    }
}

if ($params->method == 'getAll'){
	$type = "";
	if (isset($params->type)){
		$type = $params->type;
	}
	listZakazyAll($params->user_id, $type, $mysqli, $res);
}

if ($params->method == 'getBest'){
	$type = "";
	if (isset($params->type)){
		$type = $params->type;
	}
	listZakazyBest($params->user_id, $type, $mysqli, $res);
}

if ($params->method == 'getPrinttabwasopened'){
	$type = "";
	if (isset($params->type)){
		$type = $params->type;
	}
	if ($type == "transformer"){
		$query = "SELECT * FROM `gotovo` WHERE input_image!='' AND type!=2 AND printtabwasopened=1 ORDER BY id DESC  ";
	} else {
		$query = "SELECT * FROM `gotovo` WHERE input_image='' AND printtabwasopened=1 ORDER BY id DESC  ";
	}
	if ($result = $mysqli->query($query)) {
		$res['images'] = [];
		//$res['user_id'] = $token->id;
		while ($row = $result->fetch_assoc()) {
    		/* выборка данных и помещение их в массив */	
    		$res['images'][] = $row;
    	}
    }else{
    	$res['error'] = 'getPrinttabwasopened: error request gotovo'.$mysqli->error;
		die(json_encode($res));
    }
}

if ($params->method == 'getOchered'){
	$res['userwaiting'] = checkUserWaiting($params->user_id,$mysqli, $res );
	getWaitingcount($params->user_id,$mysqli, $res );
	$res['userwaitingparams'] = getUserWaitingParams($params->user_id,$mysqli, $res );
}

if (($params->method == 'addNew') && (isset($params->params)) && ($params->params != null)){

	if (!isset($params->input_image)){
		$params->input_image = null;
	}

	//var_dump($params);
	$res['userwaiting'] = checkUserWaiting($params->user_id,$mysqli, $res );
	if ($res['userwaiting']){
		getWaitingcount($params->user_id,$mysqli, $res );
	} else {
		if (!empty($params->params->initimg)) {
            //var_dump($params->params->initimg);
            if (is_array($params->params->initimg)){
                $uploadedPhotosArr = $params->params->initimg;
                $params->input_image = [];
                for ($i = 0; $i < count($uploadedPhotosArr); $i++) {
                    $data = $uploadedPhotosArr[$i];
                    if (preg_match('/^data:image\/(\w+);base64,/', $data, $type)) {
                        $data = substr($data, strpos($data, ',') + 1);
                        $type = strtolower($type[1]); // jpg, png, gif

                        if (!in_array($type, [ 'jpg', 'jpeg', 'gif', 'png' ])) {
                            throw new \Exception('invalid image type');
                        }
                        $data = str_replace( ' ', '+', $data );
                        $data = base64_decode($data);
                        $fname = $params->user_id."_".time()."_".strval($i).".{$type}";
                        file_put_contents("../outputs/qe/in/".$fname, $data);
                        $params->input_image[] = $fname;
                    }
                }
                $params->input_image = json_encode($params->input_image);
                $params->params->initimg = $params->input_image;
            } 
            
		}
		$txt2imgparams = json_encode($params->params, JSON_UNESCAPED_UNICODE);
		$sql = "INSERT INTO `status_for_edit_image` (`created`, `user_id`, `input_image`,`params` )".
		" VALUES(now(), $params->user_id, '$params->input_image', '".mysqli_real_escape_string($mysqli, $txt2imgparams)."')";
		
		if ($mysqli->query($sql) === TRUE) {
			$res['image_id'] = $mysqli->insert_id;

			getWaitingcount($params->user_id,$mysqli, $res );
		} else {
			$res['error'] = 'Ошибка 9. Ошибка обращения к базе данных. Возможно нормальной работе сайта мешает блокировщик рекламы. Например, дополнение AdBlock.';//.$mysqli->error;
		}
	}

}else{
	if ($params->method == 'addNew'){
		$res['error'] = "Ошибка запроса 12";
	}
}



if (($params->method == 'checkHirezexists') && (isset($params->image_id)) ){
	$query = "SELECT COUNT(id) as hirezex FROM `gotovo` WHERE id=$params->image_id AND hirezexists=1";
	if ($result = $mysqli->query($query)) {
		if ($row = $result->fetch_assoc()) {
			if (intval($row['hirezex']) > 0){
				$res['hirezexists'] = true;
			}
			$res['hirezexists'] = false;
		} else {
			$res['error'] = 'checkHirezexists: error request 1'.$mysqli->error;
			die(json_encode($res));
		}
	} else {
		$res['error'] = 'checkHirezexists: error request 2'.$mysqli->error;
		die(json_encode($res));
	}
}

if (($params->method == 'printtabwasopened') && (isset($params->image_id)) ){
	$sql = "UPDATE `gotovo` set printtabwasopened=1 WHERE id='$params->image_id'";
	if ($mysqli->query($sql) === TRUE) {
		$res['printtabwasopened'] = true;
	} else {
	    $res['error'] = 'printtabwasopened: Error when update records';
		die(json_encode($res));
	}
}

if ($params->method == 'getUser'){

	if ($params->user_id == -1){
		if (!isset($params->host_from)) {
			$params->host_from = "zkoridor.ru";
		}
		$sql = "INSERT INTO `users` (`created`, `host_from`)".
		" VALUES(now(), '$params->host_from')";
		
		if ($mysqli->query($sql) === TRUE) {
			$params->user_id = $mysqli->insert_id;
		} else {
			$res['error'] = 'getUser: Ошибка обращения к базе данных. Возможно нормальной работе сайта мешает блокировщик рекламы. Например, дополнение AdBlock.';//.$mysqli->error;
		}	
	} 
	if ($params->user_id != -1) {
		$query = "SELECT * FROM `users` WHERE id='$params->user_id'";
		if ($result = $mysqli->query($query)) {
			$res['user'] = $result->fetch_assoc();
		}else{
			$res['error'] = 'getUser: Ошибка обращения к базе данных'.$mysqli->error;
			die(json_encode($res));
		}
	}

}

if ($params->method == 'save_json'){
    
    $user_id = $params->user_id; 
    $save_objects = $params->save_objects;    
    $relativepath = $params->relativepath;
    $maketworkingdir = $params->maketworkingdir;
    $maketname = $params->maketname;
    $imagepath2copy = $params->imagepath2copy;
    
    
    $dir = $relativepath.$user_id."/".$maketworkingdir;
    if (!file_exists($dir)) {
        mkdir($dir, 0777, true);
    }
    if (!file_exists($dir."/".basename($imagepath2copy))) {
        copy("../".$imagepath2copy, $dir."/".basename($imagepath2copy)); 
    }
    
    $save_objects_json = json_encode($save_objects, JSON_UNESCAPED_UNICODE);
    
    file_put_contents($dir."/".$maketname, $save_objects_json);
    $res['res'] = 'OK';
    $res['maketname'] = $maketname;

    
}

function custom_copy($src, $dst) { 
  
    // open the source directory
    $dir = opendir($src); 
  
    // Make the destination directory if not exist
    @mkdir($dst); 
  
    // Loop through the files in source directory
    while( $file = readdir($dir) ) { 
  
        if (( $file != '.' ) && ( $file != '..' )) { 
            if ( is_dir($src . '/' . $file) ) 
            { 
  
                // Recursively calling custom copy function
                // for sub directory 
                custom_copy($src . '/' . $file, $dst . '/' . $file); 
  
            } 
            else { 
                copy($src . '/' . $file, $dst . '/' . $file); 
            } 
        } 
    } 
  
    closedir($dir);
} 



//mysql_close($link);
$mysqli->close();
echo json_encode($res);

/*
function movemaket($source_folder, $dest_folder,$printObjxml ){
	$source_path = "../../../proverka/automation/mainflow/2output/".$source_folder;
    $dest_path = "../../../proverka/okfolder/".$dest_folder;
    if (!file_exists($dest_path)){
      mkdir($dest_path);
      $res['dest_created'] = $dest_path;
    }

    $AllPrintObjecttemp = xml_to_array($printObjxml);
	$AllPrintObject = array();

	 $move_log = '';

	foreach ($AllPrintObjecttemp as $item) {
		$AllPrintObject[] = $item;
	}

	for ($i=0; $i<count($AllPrintObject); $i++) {
		$pornum = $i+1;
		$bezoborota = true;
		$oborot = $AllPrintObject[$i]["oborot"];
		if ($oborot != "-1"){
			$bezoborota = false;
			$rotate = $AllPrintObject[$i]["rotate"];
			$oborotpathin = $source_path."/".$oborot;
			$oborotpathout = $dest_path."/".$pornum."2_r".$rotate."_".$oborot;
			copy($oborotpathin, $oborotpathout);
			$move_log.='.oborot.'.$oborotpathin.' > '.$oborotpathout;
		}
		$litso = $AllPrintObject[$i]["lico"];
		$licopathin = $source_path."/".$litso;
		if ($bezoborota){
			$licopathout = $dest_path."/".$pornum."0_".$litso;
		} else {
			$licopathout = $dest_path."/".$pornum."1_".$litso;
		} 
		copy($licopathin, $licopathout);
		$move_log.='.lico.'.$licopathin.' > '.$licopathout;
	}
	return $move_log;

}
*/
?>