<?php

/*
|--------------------------------------------------------------------------
| Application & Route Filters
|--------------------------------------------------------------------------
|
| Below you will find the "before" and "after" events for the application
| which may be used to do any work before or after a request into your
| application. Here you may also register your custom route filters.
|
*/

App::before(function($request)
{
	$active_events = SportEvent::where('active', '1')->lists('id');
	$games = Game::whereIn('sport_event_id', $active_events)
				//->where('date', '>', new DateTime('now'))
				->where('date', '<=', new DateTime('+10 minutes'))
				->where('active', '=', '1')
				->update(array('active' => 0));

	if($games) {
		foreach ($active_events as $event) {
			Cache::forget('games_sport_event_'.$event);	
		}
		
	}


});


App::after(function($request, $response)
{

	
});

/*
|--------------------------------------------------------------------------
| Authentication Filters
|--------------------------------------------------------------------------
|
| The following filters are used to verify that the user of the current
| session is logged into this application. The "basic" filter easily
| integrates HTTP Basic authentication for quick, simple checking.
|
*/

Route::filter('auth', function()
{
	if (Auth::guest()) {
		
		return Redirect::guest('users/register')->with('error', 'Debe estar registrado/a para agregar marcadores o ver el contenido, para más información ingresar <a href="/users/rules">aquí</a>');;
	}
});


Route::filter('admin', function(){

    if (Auth::guest() || !Auth::user()->isAdmin())
    {
        return Redirect::to('/')->with('error', 'No tiene acceso a la ruta anterior.');
    }

});

Route::filter('premium', function(){

    if (Auth::guest() || !Auth::user()->isPremium())
    {
        return Redirect::to('/users/contact')->with('error', 'Por favor contactenos en el siguiente <a href="/users/contact">link</a> para poder tener accesso premium y asi pueda participar en el campeonato.');
    }

});


/*not used*/
Route::filter('same_user', function($route){


    if (Auth::user()->id != $route->getParameter('id'))
    {
        return Redirect::to('/')->with('error', 'Usted no puede editar a otros jugadores');
    }

});


Route::filter('auth.basic', function()
{
	return Auth::basic();
});

/*
|--------------------------------------------------------------------------
| Guest Filter
|--------------------------------------------------------------------------
|
| The "guest" filter is the counterpart of the authentication filters as
| it simply checks that the current user is not logged in. A redirect
| response will be issued if they are, which you may freely change.
|
*/

Route::filter('guest', function()
{
	if (Auth::check()) return Redirect::to('/');
});

/*
|--------------------------------------------------------------------------
| CSRF Protection Filter
|--------------------------------------------------------------------------
|
| The CSRF filter is responsible for protecting your application against
| cross-site request forgery attacks. If this special token in a user
| session does not match the one given in this request, we'll bail.
|
*/

Route::filter('csrf', function()
{
	if (Session::token() != Input::get('_token'))
	{
		throw new Illuminate\Session\TokenMismatchException;
	}
});
