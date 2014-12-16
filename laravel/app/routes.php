<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the Closure to execute when that URI is requested.
|
*/

/*Route::get('/', function()
{
	return View::make('hello');
});*/

/*
Now anytime that we create a new action, 
it will be available using a URI in the 
following format: /users/actionName. For 
example, we have a getRegister action, we 
can access this using the following URI: 
/users/register.
Note that we don't include the "get" part 
of the action name in the URI, "get" is just 
the HTTP verb that the action responds to.
*/
Route::controller('users', 'UsersController');


Route::get('api/search', 'UsersController@search');


Route::get('user/add_credits/{user_id}', 'UsersController@add_credits');


Route::post('user/credits', 'UsersController@credits');


Route::controller('games', 'GamesController');


Route::controller('scores', 'ScoresController');


Route::controller('teams', 'TeamsController');


Route::get('/', 'GamesController@getDashboard');


Route::controller('password', 'RemindersController');


Route::controller('admin/tools', 'BaseController');


Route::controller('events', 'SportEventsController');








