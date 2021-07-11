<?php
class Database {
	function __construct($url, $user, $pass, $db) {
		$this->url = $url;
		$this->user = $user;
		$this->pass = $pass;
		$this->db = $db;
	}
	function makeLink() {
		$this->link = new mysqli($this->url, $this->user, $this->pass, $this->db);
		if ($this->link->connect_error) {
				$db_error_reason = 'Connect Error (' . $this->link->connect_errno . ') ' . $this->link->connect_error;
				$this->writeError($db_error_reason);
				return false;
			}
		return true;
	}
	function makeQuery($query) {
		if($this->makeLink()) {
			if($result = $this->link->query($query)) {
				$this->link->close();
				return $result;
			}
			else {
				$this->writeError('Query error (' . $this->link->errno . ') ' . $this->link->error);
				$this->link->close();
				return false;
			}
		}
		else return false;
	}
	function prepare($text) {
		if($this->makeLink()) {
			if(!($query = $this->link->prepare($text))) {
				$this->writeError('Prepare error (' . $this->link->errno . ') ' . $this->link->error);
				return false;
			}
			return $query;
		}
		else return false;
	}
	function execute($query, $params) {
		if($query->bind_param(...$params)) {
			if($query->execute()) {
				if($result = $query->get_result()) return $result;
				else return true;
			}
			else {
				$this->writeError('Execute error (' . $query->errno . ') ' . $query->error);
				return false;
			}
		}
		else {
			$this->writeError('Bind error (' . $query->errno . ') ' . $query->error);
			return false;
		}
	}
	function closeLink() {
		$this->link->close();
	}
	
	function writeError($error) {
    	$log = fopen('../../Errors.log', 'a');
    	fwrite($log, "\n" . date('F, D, \D\a\y j, H:i:s: ') . $error . '.');
    	fclose($log);
	}
}
class Response {
	function setDiscarded($array) {
		$this->Discarded = $array;
	}
	function send() {
		echo json_encode($this);
	}
}
function sendDiscarded($discarded) {
	if (count($discarded)) {
		$response = new Response;
		$response->setDiscarded($discarded);
		$response->send();
	}
}

$db = new Database('localhost', 'f0560736_Pyotr', 'SMSACTIVATE', 'f0560736_database');
?>