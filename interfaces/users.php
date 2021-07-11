<?php 
    require_once $_SERVER["DOCUMENT_ROOT"].'/library/db.php';
    $input = json_decode(file_get_contents('PHP://input'), true);
    if ($_SERVER['REQUEST_METHOD'] == 'GET' && $_GET['exit'] == true) {
        setcookie('Login', null, -1, '/');
    }
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $row = getUser($input['Login']);
        if ($row->num_rows != 0) {
            $user = $row->fetch_assoc();
            if (password_verify($input['Password'], $user['Password'])) {
                setcookie('Login', $user['Login'], time()+86400, '/');
                echo json_encode(true);
            }
            else echo json_encode(false);
        }
        else echo json_encode(false);
    }

    function getUser($login) {
        global $db;
        return $db->execute($db->prepare('SELECT Login, Password FROM users WHERE Login = ?'), ['s', $login]);
    }
    function getUserRole($login) {
        global $db;
        return $db->execute($db->prepare('SELECT Role FROM `user-role` WHERE User = ?'), ['s', $login])->fetch_assoc()['Role'];
    }
?>