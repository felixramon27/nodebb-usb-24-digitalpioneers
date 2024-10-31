<div class="row">
	<div class="col-12 col-sm-8 offset-sm-2">
		<p class="lead text-center">
			{{{ if register }}}[[register:interstitial.intro-new]]{{{ else }}}[[register:interstitial.intro]]{{{ end }}}
		</p>

		{{{ if errors.length }}}
		<div class="alert alert-warning">
			<p>
				[[register:interstitial.errors-found]]
			</p>
			<ul>
				{{{each errors}}}
				<li>{@value}</li>
				{{{end}}}
			</ul>
		</div>
		{{{ end }}}
	</div>
</div>

<form role="form" method="post" action="{config.relative_path}/register/complete" enctype="multipart/form-data">
	<input type="hidden" name="csrf_token" value="{config.csrf_token}" />
	
<!-- Desde aqui es el cambio -->
	<div class="row mb-3">
		<div class="col-12 col-sm-8 offset-sm-2">
			<div class="card">
				<div class="card-body">
					<div class="form-group">
						<h4> Rol de usuario </h4>
						<p>Esta información es esencial para personalizar tu experiencia y garantizar que accedas a las funcionalidades adecuadas. Si eres estudiante, podrás comunicarte fácilmente con tus profesores y compañeros, recibir retroalimentación y acceder a recursos específicos para tu aprendizaje. Si eres profesor, podrás gestionar las consultas de tus alumnos, crear grupos y mantener una comunicación fluida (p.ej: eliminar mensajes indeseados). Al elegir correctamente tu rol, aseguramos que obtengas el máximo provecho de nuestra plataforma.</p>
						<label for="role" class="mb-3"> Selecciona tu rol: </label>
						<select class="form-control" id="selectRole" name="selectRole">
							<option value="user"> Estudiante </option>
							<option value="admin"> Profesor </option>
						</select>
						<p><small> Si no seleccionas ningún rol, por defecto se te asignará rol de estudiante. </small></p>
					</div>
				</div>
			</div>
		</div>
	</div>
<!-- Hasta aqui -->

	{{{each sections}}}
	<div class="row mb-3">
		<div class="col-12 col-sm-8 offset-sm-2">
			<div class="card">
				<div class="card-body">
					{@value}
				</div>
			</div>
		</div>
	</div>
	{{{end}}}

	<div class="row mt-3">
		<div class="col-12 col-sm-8 offset-sm-2 d-grid">
			<button class="btn btn-primary">[[topic:composer.submit]]</button>
			<button class="btn btn-link" formaction="{config.relative_path}/register/abort">{{{ if register }}}[[register:cancel-registration]]{{{ else }}}[[modules:bootbox.cancel]]{{{ end }}}</button>
		</div>
	</div>
</form>
