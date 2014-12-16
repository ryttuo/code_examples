    <div class="form-group">
        <div class="col-md-offset-2 col-md-8">
            <div class='input-group date' id='datetimepicker'>
                {{ Form::text('date', null, array('class'=>'form-control', 'placeholder'=>'Fecha y Hora')) }}
                <span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span>
                </span>
            </div>
        </div>
    </div>
    <div class="form-group">
        <div class="col-md-offset-2 col-md-8">
        	<div class="input-group">
	        	<input type="text" class="form-control" value="Favoritos" readonly="true">
	    		<span class="input-group-addon">
	    			{{ Form::checkbox('starred', null, false) }}
	    		</span>
        	</div> 
        </div>
    </div>
    <div class="form-group">
        <div class="col-md-offset-2 col-md-8">
            <div class="input-group">
                <input type="text" class="form-control" value="Evento" readonly="true">
                <span class="input-group-addon">
                <?php $selected = $game->sport_event_id or '' ?>
                    {{ Form::select('sport_event', $events, $selected) }}
                </span>
            </div>
        </div>
    </div>
    <div class="form-group">
        <div class="col-md-offset-2 col-md-8">
        	<div class="input-group">
	        	<input type="text" class="form-control" value="Casa" readonly="true">
	    		<span class="input-group-addon">
                <?php $selected = $game->home_team_id or '' ?>
	    			{{ Form::select('home_team', $teams, $selected) }}
	    		</span>
        	</div>
        </div>
    </div>
    <div class="form-group">
        <div class="col-md-offset-2 col-md-8">
            {{ Form::text('home_score', null, array('class'=>'form-control', 'placeholder'=>'Marcador Casa', 'value' => '0')) }}        
        </div>
    </div>
    <div class="form-group">
        <div class="col-md-offset-2 col-md-8">
            <div class="input-group">
	        	<input type="text" class="form-control" value="Visita" readonly="true">
	    		<span class="input-group-addon">
                <?php $selected = $game->visit_team_id or '' ?>
	    			{{ Form::select('visit_team', $teams, $selected); }}
	    		</span>
        	</div>
        </div>
    </div>
    <div class="form-group">
        <div class="col-md-offset-2 col-md-8">
            {{ Form::text('visit_score', null, array('class'=>'form-control', 'placeholder'=>'Marcador Visita', 'value' => '0')) }}        
        </div>
    </div>
    <div class="form-group">
        <div class="col-md-offset-2 col-md-8">
            <div class="input-group">
                <span class="input-group-addon">Valor de créditos</span>
                {{ Form::text('credits', null, array('class'=>'form-control', 'placeholder'=>'créditos', 'value' => '1')) }}          
            </div>
        </div>
    </div>
    <div class="form-group">
        <div class="col-md-offset-2 col-md-8">
            <div class="input-group">
                <span class="input-group-addon">Valor acumulado</span>
                {{ Form::text('accumulated', null, array('class'=>'form-control', 'placeholder'=>'Acumulado', 'value' => '0')) }}          
            </div>
        </div>
    </div>
    <div class="form-group">
        <div class="col-md-offset-2 col-md-8">
            <div class="input-group">
                <input type="text" class="form-control" value="Apuesta activa" readonly="true">
                <span class="input-group-addon">
                    {{ Form::checkbox('active', null, true) }}
                </span>
            </div> 
        </div>
    </div>
     <div class="form-group">
        <div class="col-md-offset-2 col-md-8">
            <div class="input-group">
                <input type="text" class="form-control" value="Restaurar marcadores premium" readonly="true">
                <span class="input-group-addon">
                    {{ Form::checkbox('reset_premium', null, false) }}
                </span>
            </div> 
        </div>
    </div>
    <div class="form-group">
        <div class="col-md-offset-2 col-md-8">
            <div class="input-group">
                <input type="text" class="form-control" value="Finalizado" readonly="true">
                <span class="input-group-addon">
                    {{ Form::checkbox('finished', null, false) }}
                </span>
            </div> 
        </div>
    </div>
    <div class="form-group">
        <div class="col-md-offset-2 col-md-8">
        {{ Form::textarea('comment', null, array('class'=>'form-control', 'placeholder'=>'Comentario alerta en el partido')) }}        
        </div>
    </div>
    <div class="form-group">
        <div class="col-md-offset-2 col-md-8">
            <div class="input-group">
                <input type="text" class="form-control" value="Enviar Correos Ganadores" readonly="true">
                <span class="input-group-addon">
                    {{ Form::checkbox('send_emails', null, false) }}
                </span>
            </div> 
        </div>
    </div>
     <div class="form-group">
        <div class="col-md-offset-2 col-md-8">
            <div class="input-group">
                <input type="text" class="form-control" value="Enviar Correos Premiums sin Marcador" readonly="true">
                <span class="input-group-addon">
                    <?php $disabled = (!$game->active)?'disabled':'' ?>
                    {{ Form::checkbox('send_emails_not_score', null, false, array($disabled)) }}
                </span>
            </div> 
        </div>
    </div>
    <div class="form-group">
        <div class="col-md-offset-2 col-md-8">
        {{ Form::textarea('email_comment', null, array('class'=>'form-control', 'placeholder'=>'Comentario agregado para los correos de marcadores premium')) }}        
        </div>
    </div>