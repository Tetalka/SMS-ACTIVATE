<!DOCTYPE HTML>
<html>
	<head>
		<title>SMS-activate</title>
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<link href='https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/css/bootstrap.min.css' rel='stylesheet' integrity='sha384-eOJMYsd53ii+scO/bJGFsiCZc+5NDVN2yr8+0RDqr0Ql0h+rP48ckxlpbzKgwra6' crossorigin='anonymous'>
		<link rel='stylesheet' href='styles/style.css'>
		<?php 
			require_once $_SERVER["DOCUMENT_ROOT"].'/library/db.php';
			require_once $_SERVER["DOCUMENT_ROOT"].'/library/services.php';
			require_once $_SERVER["DOCUMENT_ROOT"].'/interfaces/users.php';
			$admin = $_COOKIE['Login'] && getUserRole($_COOKIE['Login']) == 'Admin';
			if ($admin) echo '<link rel="stylesheet" href="styles/adminStyles.css">';
		?>
	</head>
	<body>
		<div class='container header'>
			<div class='float-end'>
				<?php 
					if($_COOKIE['Login'])
						echo "<button class='btn btn-success dropdown-toggle' id='userMenuButton' data-bs-toggle='dropdown' aria-expanded='false'>{$_COOKIE['Login']}</button>
						<ul class='dropdown-menu' aria-labelledby='userMenuButton'>
							<li class='dropdown-item exitButton'>Exit</li>
						</ul>";
					else {
						echo "<button class='btn btn-success login' data-bs-toggle='modal' data-bs-target='.modal.fade'>Войти</button>";
					}
				?>
			</div>
		</div>
		<div class='container'>
			<h1>Выбор сервиса</h1>
			<div class='row m-0'>
				<select class='form-select'>
				<?php 
					$countries = $db->makeQuery('SELECT * FROM countries');
					while ($country = $countries->fetch_assoc()) {
						echo "<option value='{$country['Name']}'>{$country['Name']}</option>";
					}
				?>
				</select>
				<?php 
					if ($admin) echo "<button class='btn btn-success btn-edit countries-edit-button' data-bs-toggle='modal' data-bs-target='.countries-modal'>Страны</button>
					<button class='btn btn-success btn-edit services-edit-button' data-bs-toggle='modal' data-bs-target='.services-modal'>Сервисы</button>";
				?>
			</div>
			<table class='table service-choose'>
				<tbody>
					<tr class='headers'>
						<th><span class='table-header'>Название</span></th>
						<th><span class='table-header'>Цена</span></th>
						<th><span class='table-header'>Количество</span></th>
					</tr>
					<?php 
						$services = getServices(['Name, Price, Amount'], 'Россия');
						while ($service = $services->fetch_assoc()) {
							$price = $service['Price'];
							echo "<tr><td name='Name'>{$service['Name']}</td><td name='Price'>{$price}</td><td name='Amount'>{$service['Amount']}</td></tr>";
						}
					?>
				</tbody>
			</table>
		</div>
		<div class="modal fade" aria-labelledby="ModalLoginLabel" aria-hidden="true">
			<div class="modal-dialog">
				<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title" id="ModalLoginLabel">Вход</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div class="modal-body">
					<form class='form' action='interfaces/users.php' method='POST'>
						<label class='label'>
							Логин
							<input class="form-control" name="Login">
						</label>
						<label class='label'>
							Пароль
							<input class="form-control" type='password' name="Password">
						</label>
					</form>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
					<button type="button" class="btn btn-success sendLogin">Войти</button>
				</div>
				</div>
			</div>
		</div>
		<?php 
			if ($admin) {
				$countriesHTML = "";
				$countries->data_seek(0);
				while ($country = $countries->fetch_assoc()) {
					$countriesHTML .= "<div class='editable-field country'><div class='editable-value to-update' contenteditable value='{$country['Name']}'>{$country['Name']}</div>
					<button class='btn btn-danger editable-field-button button-delete'>X</button></div>";
				}
				echo "
				<div class='modal fade countries-modal' aria-labelledby='modalCountriesLabel' aria-hidden='true'>
					<div class='modal-dialog'>
						<div class='modal-content'>
							<div class='modal-header'>
								<h5 class='modal-title' id='modalCountriesLabel'>Страны</h5>
								<button type='button' class='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>
							</div>
							<div class='modal-body countries-form'>
							{$countriesHTML}
							</div>
							<div class='modal-footer'>
								<button type='button' class='btn btn-success country-add'>Добавить</button>
								<button type='button' class='btn btn-secondary' data-bs-dismiss='modal'>Закрыть</button>
								<button type='button' class='btn btn-success sendChanges'>Сохранить</button>
							</div>
						</div>
					</div>
				</div>
				";
				echo "
				<div class='modal fade services-modal' aria-labelledby='modalServicesLabel' aria-hidden='true'>
					<div class='modal-dialog services-edit'>
						<div class='modal-content'>
							<div class='modal-header'>
								<div class='slider-buttons'>
									<h5 class='modal-title slider-button slider-button-active' id='modalServicesLabel'>Сервисы</h5>
									<h5 class='modal-title slider-button history-button'>История</h5>
								</div>
								<button type='button' class='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>
							</div>
							<div class='modal-body services-form'>
								<div class='slider-slide slider-slide-active'>
									<div class='row'>
										<div class='col-sm'>
											<div class='country-services'>
											<h5>Сервисы для страны <span class='service-country'></span></h5>
											<table class='table'>
												<tbody>
													<tr class='headers'>
														<th><span class='table-header'>Название</span></th>
														<th><span class='table-header'>Цена</th>
														<th><span class='table-header'>Количество</th>
														<th><span class='table-header'></th>
													</tr>
												</tbody>
											</table>
											</div>
										</div>
										<div class='col-sm'>
											<div class='services'>
											<h5>Все сервисы</h5>
												<table class='table'>
													<tbody>
														<tr class='headers'>
															<th>Название</th>
															<th>Количество</th>
															<th></th>
														</tr>
													</tbody>
												</table>
											</div>
												<button type='button' class='btn btn-success service-add'>Добавить</button>
										</div>
									</div>
								</div>
								<div class='slider-slide'>
									<h5>История сервисов</h5>
									<table class='table history'>
										<tbody>
											<tr class='headers'>
												<th><span class='table-header'>Страна</span></th>
												<th><span class='table-header'>Сервис</th>
												<th><span class='table-header'>Цена</th>
												<th><span class='table-header'>Дата изменения</th>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
							<div class='modal-footer'>
								<button type='button' class='btn btn-secondary' data-bs-dismiss='modal'>Закрыть</button>
								<button type='button' class='btn btn-success sendChanges'>Сохранить</button>
							</div>
						</div>
					</div>
				</div>
				";
			}
		?>
		<script src='scripts/script.js'></script>
		<?php 
			if ($admin) echo "<script src='scripts/adminScript.js'></script>";
		?>
		<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
	</body>
</html>