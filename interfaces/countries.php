<?php
    require_once '../library/countries.php';
    $input = json_decode(file_get_contents('PHP://input'), true);
    if(!$_COOKIE['Login']) {
        http_response_code(403);
        return;
    }
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $discarded = array();
        foreach ($input['data'] as $value) {
           if(!addCountry($value)) array_push($discarded, $value);
        } 
        sendDiscarded($discarded);
    }
    if ($_SERVER['REQUEST_METHOD'] == 'PUT') {
        $discarded = array();
        foreach($input['data'] as $value) {
            if(!updateCountry($value['New'], $value['Name'])) array_push($discarded, $value);
        }
        sendDiscarded($discarded);
    }
    if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
        $discarded = array();
        foreach ($input['data'] as $value) {
            if(!deleteCountry($value)) array_push($discarded, $value);
        }
        sendDiscarded($discarded);
    }
?>