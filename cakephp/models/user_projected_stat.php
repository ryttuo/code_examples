<?php
// Projected stat model.
class UserProjectedStat extends AppModel {
	
	public $useTable = 'user_projected_stats';

	//Load some models	
	public function __construct($id = false, $table = null, $ds = null) {
		parent::__construct($id, $table, $ds);
		$this->GameStat = ClassRegistry::init('PlayerDb.GameStat');
		$this->ProjectedStat = ClassRegistry::init('PlayerDb.ProjectedStat');
		$this->Site = ClassRegistry::init('Site');
	}
	

	//big query to get data from user projected stats table
	public function userProjectedStatsForSport($user_id = null, $sport_id = null, $position = null, $site_id = null, $db_only = false, $player_id = null){

		$key = 'sport_user_projected_stats_'.$sport_id.'_'.$site_id.'_'.$position.'_'.$user_id;
		
		Cache::set(array('duration' => '+24 hours'));
		$stats = $db_only ? null : Cache::read($key);

		if (empty($stats)){

			$fields = array(
				'UserProjectedStat.*',
				'Player.*',
				'Position.*',
				'Salary.*'
			);


			$joins = array(

				array(
					'table' => 'playerdb.players',
					'alias' => 'Player',
					'conditions' => array(
					'Player.id = UserProjectedStat.player_id',
					"Player.league_id = {$sport_id}",
					'Player.starting != 0'
				)),

				array(
					'table' => 'playerdb.positions',
					'alias' => 'Position',
					'conditions' => array('Player.position_id = Position.id')
				)
			);
			
			if(!empty($player_id)){
				$conditions['UserProjectedStat.player_id'] = $player_id;
			} else {
				$conditions['Salary.position'] = $position;
			}

			array_push($joins, array(
				'table' => 'rotogrinders.salaries', 
				'alias' => 'Salary',
				'conditions' => array('Salary.player_id = Player.id', 'Salary.site_id = '.$site_id)
			));

			$conditions['UserProjectedStat.user_id'] = $user_id;
			

			$stats = $this->find('all', array(
				'fields' => $fields,
				'joins' => $joins,
				'conditions' => $conditions
			));


			if(!empty($stats)){
					
				foreach($stats as &$stat){
						$stat['ProjectedStat'] = $stat['UserProjectedStat'];
						$stat['ProjectedStat']['id'] = $stat['ProjectedStat']['id']."--u";
				}
			}

			$stats = $this->ProjectedStat->formatGameStatsSport($stats, $site_id, $db_only, null, true, false);
			

			foreach ($stats as &$stat) {
				
				//debug($stat);
				$data = $this->summarizedStatsForPlayer($stat['Player']['id'], '-5 hours', null, $stat['Player']['league_id'], $site_id);
				$stat['Sites'] = $data['Sites'];
				//$stat['Sites']['site_id_0'] = $stat['ProjectedStat']['fp'];
				$stat['Formulas'] = $data['Formulas'];
				$stat['Salaries'] = $data['Salaries'];
				$stat['Positions'] = $data['Positions'];
				$stat['ProjectedStat']['fp'] = $data['Sites']['site_id_'.$site_id];
				if(!empty($stat['ProjectedStat']['overridden_fp']) && $stat['ProjectedStat']['overridden_fp'] > 0){
					$stat['ProjectedStat']['fp'] = $stat['ProjectedStat']['overridden_fp'];
				}else{
					$stat['ProjectedStat']['fp'] = $stat['Sites']['site_id_'.$site_id];
				}
				
				
			}

			if(empty($player_id)){
				Cache::set(array('duration' => '+24 hours'));
				Cache::write($key, $stats);
			}

		}
		return $stats;
	}

	//several calculations to get stats for players
	public function summarizedStatsForPlayer($player_id, $timeframe = '-7 days', $opponent = null, $sport_id = null, $site_id = null) {

		$key = 'player_user_projected_stats_'.$player_id.'_'.str_replace('-', '', str_replace(' ', '_', $timeframe));
		

		$data = Cache::read($key);
		$data = array();

		if (empty($data)) {
			
			$this->Player = ClassRegistry::init('PlayerDb.Player');
			//$this->ProjectedStat = ClassRegistry::init('PlayerDb.ProjectedStat');

			$site_query = (!empty($site_id))?"PositionValue.site_id = '{$site_id}' and":null;
			
			$query = "
				SELECT PositionValue.site_id, PositionValue.sport_id, PositionValue.formula, PositionValue.position, PositionValue.jsf
				FROM rotogrinders.position_values AS PositionValue
				JOIN playerdb.players AS Player ON Player.league_id = PositionValue.sport_id
				WHERE {$site_query} Player.id = '{$player_id}'
				AND PositionValue.position = (SELECT position FROM rotogrinders.salaries WHERE site_id = PositionValue.site_id AND player_id = Player.id GROUP BY position)";

			$formulas = $this->query($query);

			$fields = array();

			$conditions = array();
			$jsf = array();
			
			if(!empty($formulas)){
			
				for ($i = 1; $i < 33; $i++) $fields[] = 'AVG(stat'.$i.') AS `stat'.$i.'`';
				$first = true;
				foreach ($formulas as $item){ 
					
					if($first){
						//$jsf['site_id_0'] = $this->ProjectedStat->jsfGrinders($item['PositionValue']['sport_id'], $item['PositionValue']['position']);
						$first = false;
					}
					$fields[] = 'AVG('.$item['PositionValue']['formula'].') AS `site'.$item['PositionValue']['site_id'].'_score`';
					$jsf['site_id_'.$item['PositionValue']['site_id']] = $item['PositionValue']['jsf'];
				}	
				
				$conditions['UserProjectedStat.player_id'] = $player_id;
				
				if (!is_null($opponent)) $conditions['OR'] = array('Schedule.home_id' => $opponent, 'Schedule.away_id' => $opponent);
				
				$data = $this->find('first', array(
					'fields' => $fields,
					'conditions' => $conditions,
					/*'joins' => array(
				array(
							'table' => 'playerdb.schedules',
							'alias' => 'Schedule',
							'conditions' => array('Schedule.id = ProjectedStat.schedule_id')
				))*/
				));

				
				$data = $this->GameStat->formatStats($data[0], $formulas[0]['PositionValue']['sport_id'], $formulas[0]['PositionValue']['position'], 1);
				$salary_data = ClassRegistry::init('Player')->salariesForPlayer($player_id, $site_id);

				$data['Formulas'] = $jsf;
				$data['Salaries'] = $this->ProjectedStat->extractSiteSalaries($salary_data);
				$data['Positions'] = $this->ProjectedStat->extractSitePositions($salary_data);
				
				Cache::write($key, $data);
				
			}
		}


		return $data;
	}

	//get cap value for site and sport
	public function getCap($site_id, $sport_id){

		// FanDuel		
		if($site_id == 2){

			switch($sport_id){

				case 1:
					return 60000;
					break;
				case 2:
					return 35000;
					break;
				case 3:
					return 60000;
					break;
			}		

		// DraftStreet	
		}else if($site_id == 9){

			return 100000;
			
		// DraftDay	
		}else if($site_id == 15){

			return 100000;

		// Swoopt
		}else if($site_id == 39){

			return 100000;

		// FanThrowdown
		} else if ($site_id == 24) {

			return 100000;

		// DailyJoust
		}else if($site_id == 12){

			return 100000;

		// ProfanitySports		
		}else if($site_id == 16){

			return 100000000;

		// FSL
		}else if($site_id == 6){

			switch($sport_id){

				case 1:
					return 950;
					break;
				case 2:
					return 450;
					break;
				case 3:
					return 250;
					break;
			}

		// DraftKings
		} else if ($site_id == 20) {
			return 50000;

		// StarStreet
		} else if ($site_id == 18) {
			return 100000;

		// DraftZone		
		}else if($site_id == 1){
			
			return 60000;		

		// FantasyFeud
		} else if ($site_id == 19) {
			return 1000000;
		}

	}


	//get positions by site and sport
	public function allPositionsSite($site_id, $sport_id){

		// FanDuel		
		if($site_id == 2){

			switch($sport_id){

				case 1:
					return array('QB', 'RB', 'RB', 'WR', 'WR', 'WR', 'TE', 'K', 'D');
					break;
				case 2:
					return array('P', 'C', '1B', '2B', '3B', 'SS', 'OF', 'OF', 'OF');
					break;
				case 3:
					return array('PG', 'PG', 'SG', 'SG', 'SF', 'SF', 'PF', 'PF', 'C');
					break;
			}		

		// DraftStreet	
		}else if($site_id == 9){

			switch($sport_id){

				case 1:
					return array('QB', 'QB', 'RB', 'RB', array('RB', 'WR'), array('RB', 'WR'), 'WR', 'WR', 'TE', 'DST');
					break;
				case 2:
					return array('SP', 'SP', 'SP', 'C', '1B', '2B', '3B', 'SS', array('CF', 'LF', 'RF'), array('CF', 'LF', 'RF'), array('CF', 'LF', 'RF'), array('C', '1B', '2B', '3B', 'SS', 'CF', 'LF', 'RF', 'DH'));
					break;
				case 3:
					return array('G', 'G', 'G', 'F', 'F', 'F', 'C', array('G', 'F', 'C'));
					break;
			}		

		// DraftDay	
		}else if($site_id == 15){

			switch($sport_id){

				case 1:
					return array('QB', 'RB', 'RB', 'WR', 'WR', 'TE', array('WR', 'TE', 'RB'), 'K', 'DST');
					break;
				case 2:
					return array('P', 'P', 'C', '1B', '2B', '3B', 'SS', 'OF', 'OF', 'OF', array('C', '1B', '2B', '3B', 'SS', 'OF', 'DH'));
					break;
				case 3:
					return array('PG', 'PG', 'SG', 'SG', 'SF', 'SF', 'PF', 'PF', 'C');
					break;
			}		

		// Swoopt
		}else if($site_id == 39){

			switch($sport_id){

				case 1:
					return array();
					break;
				case 2:
					return array('P', 'P', 'C', '1B', '2B', '3B', 'SS', 'OF', 'OF');
					break;
				case 3:
					return array();
					break;
			}		
		// DailyJoust
		}else if($site_id == 12){

			switch($sport_id){

				case 1:
					return array('QB', 'RB', 'RB', 'WR', 'WR', 'WR', 'TE', 'K', 'DEF');
					break;
				case 2:
					return array('SP', array('1B', 'DH'), '2B', 'SS', '3B', array('LF', 'CF', 'RF'), array('LF', 'CF', 'RF'), array('LF', 'CF', 'RF'), 'C');
					break;
				case 3:
					return array('C', 'PF', 'PF', 'SF', 'SF', 'SG', 'SG', 'PG', 'PG');
					break;
			}	

		// FanThrowdown
		}else if($site_id == 24){

			switch($sport_id){
				case 1:
					return array('QB', 'QB', 'RB', 'RB', 'WR', 'WR', 'WR', 'TE', array('WR', 'TE', 'RB'), 'DST');
					break;

				case 2:
					return array('SP', 'SP', 'C', '1B', '2B', '3B', 'SS', array('CF', 'LF', 'RF'), array('CF', 'LF', 'RF'), array('CF', 'LF', 'RF'));
					break;

				case 3:
					return array('PG', 'PG', 'SG', 'SG', 'SF', 'SF', 'PF', 'PF', 'C', array('PG', 'SG', 'SF', 'PF', 'C'));
					break;
			}

		// ProfanitySports		
		}else if($site_id == 16){

			switch($sport_id){

				case 1:
					return array('QB', 'RB', 'RB', 'WR', 'WR', 'WR', 'TE', array('RB', 'WR'), array('RB', 'WR'), 'PK', 'DF');
					break;
				case 2:
					return array(array('SP'), array('RP'), array('SP', 'RP'), 'IF', 'IF', 'IF', 'IF', 'OF', 'OF', 'OF', 'C', array('IF', 'OF', 'C', 'DH'));
					break;
				case 3:
					return array('G', 'G', 'F', 'F', 'C', array('G', 'F', 'C'), array('G', 'F', 'C'), array('G', 'F', 'C'));
					break;
			}	

		// FSL
		}else if($site_id == 6){

			switch($sport_id){

				case 1:
					return array('QB', 'RB', 'RB', 'WR', 'WR', 'WR', 'TE', 'K', 'DEF');
					break;
				case 2:
					return array('P', 'C', '1B', '2B', 'SS', '3B', 'RF', 'CF', 'LF');
					break;
				case 3:
					return array('PG', 'PG', 'SG', 'SG', 'SF', 'SF', 'PF', 'PF', 'C');
					break;
			}

		// DraftZone		
		}else if($site_id == 1){
			
			switch($sport_id){

				case 1:
					return array('QB', 'RB', 'RB', 'WR', 'WR', 'WR', 'TE', 'K', 'DT');
					break;
				case 2:
					return array('SP', 'SP', 'RP', 'C', array('1B', '2B'), array('2B', 'SS'), array('LF', 'RF', 'CF'), array('LF', 'RF', 'CF'), array('1B', '2B', '3B', 'SS', 'C', 'LF', 'RF', 'CF', 'DH'));
					break;
				case 3:
					return array('G', 'G', 'G', 'F', 'F', 'F', 'C');
					break;
			}			
		// FantasyFeud
		}else if($site_id == 19){
		
			switch($sport_id){
				
				case 1:
					return array('QB', 'QB', 'RB', 'RB', 'WR', 'WR', 'TE', array('WR', 'TE', 'RB'), array('WR', 'TE', 'RB'), 'K', 'DEF');
					break;
				case 2:
					return array('SP', 'SP', 'SP', 'C', '1B', '2B', '3B', 'SS', 'OF', 'OF', 'OF', array('C', '1B', '2B', '3B', 'SS', 'OF', 'DH'), array('C', '1B', '2B', '3B', 'SS', 'OF', 'DH'));
					break;
				case 3:
					return array('G', 'G', 'G', 'F', 'F', 'F', 'C', 'C', array('G', 'F', 'C'), array('G', 'F', 'C'));
					break;
			}

		// StarStreet
		}else if($site_id == 18){

			switch($sport_id){

				case 1:
					return array('QB', 'QB', 'RB', 'RB', 'WR', 'WR', 'TE', array('WR', 'TE', 'RB'), array('WR', 'TE', 'RB'));
					break;

				case 2:
					return array('P', 'P', 'C', '1B', '2B', '3B', 'SS', array('LF', 'RF', 'CF'),array('LF', 'RF', 'CF'), array('LF', 'RF', 'CF'), array('1B', '2B', '3B', 'SS', 'C', 'LF', 'RF', 'CF', 'DH'));
					break;

				case 3:
					return array('PG', 'SG', 'SF', 'PF', 'C', array('PG', 'SG'), array('PF', 'SF'), array('SG', 'SF', 'PF', 'PG', 'C'), array('SG', 'SF', 'PF', 'PG', 'C'));
			}

		// DraftKings
		}else if($site_id == 20){

			switch($sport_id){
				
				case 1:
					return array('QB', 'RB', 'RB', 'WR', 'WR', 'TE', array('WR', 'TE', 'RB'), 'K', 'DST');
					break;

				case 2:
					return array('C', array('1B', 'DH'), '2B', '3B', 'SS', 'OF', 'OF', 'OF', 'SP', 'SP');
					break;

				case 3:
					return array('PG', 'SG', 'SF', 'PF', 'C', array('PG', 'SG'), array('PF', 'SF'), array('PG', 'SG', 'SF', 'PF', 'C'));
					break;
			}

		}else{

			return false;
		}
	}

	
	//function to update memcache 
	public function updateCache($data, $sport_id, $site_id){

		if(!empty($data)){

			$user_id = CakeSession::read('Auth.User.id');
			$tmp = current(array_slice($data['ProjectedStat'], 0));
			
			$position_id_tmp = $tmp['position_id'];
			$position_hashtag = $tmp['hashtag'];
			$cache_data_by_position = array();
			$array_projections_by_position = array();
			$sites = Configure::read('Globals.sites');
			$site_ids = array_keys($sites);		
		}

		$i = 0;
		foreach ($data['ProjectedStat'] as $key => $stat) {
			$next_position = current(array_slice($data['ProjectedStat'], $i+1));
			$next_position_id = (isset($next_position['position_id']))?$next_position['position_id']:'-1';
			$next_position_hashtag = (isset($next_position['hashtag']))?$next_position['hashtag']:'-1';
			
			if($position_id_tmp != $next_position_id){

				$cache_data_by_position[$stat['player_id']] = $stat;
				$key_user_projected_stats = 'sport_user_projected_stats_'.$sport_id.'_'.$site_id.'_'.$position_hashtag.'_'.$user_id;
				Cache::set(array('duration' => '+24 hours'));
				$projected_stats = Cache::read($key_user_projected_stats);
				$array_player_ids = array_keys($cache_data_by_position);
				
				if(!empty($projected_stats)) {

					foreach ($projected_stats as $ps_key => &$projected_stat) {
						$val_search = array_search($projected_stat['ProjectedStat']['player_id'], $array_player_ids);
						
						if($val_search !== FALSE) {
							
							unset($array_player_ids[$val_search]);
							$row_data = $this->userProjectedStatsForSport($user_id, $sport_id, null, $site_id, true, $projected_stat['ProjectedStat']['player_id']);
							$projected_stat = $row_data[0];
					
						}
					}
					
					if($i == 1)
					

					if(!empty($array_player_ids)){
						
						$new_stats = array();
						foreach ($array_player_ids as $player_id) {
							$row_data = $this->userProjectedStatsForSport($user_id, $sport_id, null, $site_id, true, $player_id);
							$new_stats[] = $row_data[0];
						}
						$projected_stats = array_merge($projected_stats, $new_stats);
					}
				
					$cache_data_by_position = array();
					$array_projections_by_position = array();
					Cache::set(array('duration' => '+24 hours'));
					Cache::write($key_user_projected_stats, $projected_stats);

				}

			} else {
				$cache_data_by_position[$stat['player_id']] = $stat;
			}
			$position_id_tmp = $next_position_id;
			$position_hashtag = $next_position_hashtag;
			$i++;
		}

	
	}

	//update fields from all stats
	public function updateStatField($data){

		//$this->ProjectedStat = ClassRegistry::init('PlayerDb.ProjectedStat');
		//$this->GameStat = ClassRegistry::init('PlayerDb.GameStat');

		if(!empty($data['UserProjectedStat']['player_id'])){
			$projected_stat = $this->find('first', array(
			'conditions' => array(
				'UserProjectedStat.player_id' => $data['UserProjectedStat']['player_id'])
			));
			
			$game_stat_id = (empty($projected_stat['UserProjectedStat']['id']))?null:$projected_stat['UserProjectedStat']['id'];
			$player_id = $data['UserProjectedStat']['player_id'];
			
			
		}else{
			$game_stat_id = $data['UserProjectedStat']['id'];
			
			if(is_numeric($game_stat_id)){
				$game_stat = $this->ProjectedStat->find('first', array(
					'conditions' 	=> array('ProjectedStat.id' => $game_stat_id),
					'fields'		=> array('player_id')
				));
				$player_id = $game_stat['ProjectedStat']['player_id'];
				$game_stat_id = null;

			}else{

				list($id, $garbage) = explode('--', $game_stat_id);
				$game_stat_id = $id;
				$game_stat = $this->find('first', array(
					'conditions' 	=> array('UserProjectedStat.id' => $game_stat_id),
					'fields'		=> array('player_id')
				));
				$player_id = $game_stat['UserProjectedStat']['player_id'];	
			}

			
		}

		$user_id = $data['User']['id'];
		$sport_id = $data['League']['id'];
		$columns = $data['Position']['columns'];
		$position_hashtag = $data['Position']['hashtag'];
		$position_id = $data['Position']['id'];
		$column_name = $data['Column']['name'];

		
		$next_matchup = $this->GameStat->nextMatchup($player_id);
			
		$schedule_id = (empty($next_matchup))?0:$next_matchup['Schedule']['id'];
		//debug($schedule_id);
		
		if(empty($game_stat_id)){
			$stat_data = array('player_id' => $player_id, 'schedule_id' => $schedule_id, 'user_id' => $user_id);
		}else{
			$this->id = $game_stat_id;
			$stat_data = array();
		}
		
		foreach($columns as $stat){
			
			if($stat['name'] == 'weight' || $stat['name'] == 'status'){
				$stat_number = $stat['name'];
			}else{
				$stat_number = $this->GameStat->getStatNumber($sport_id, $stat['name'], $position_hashtag);
			}
			$stat_data[$stat_number] = $stat['val'];
			
			 
		}
		//debug($stat_data);
		
		
		
		if($this->save($stat_data)){
		//if(false){
		
			$game_stat_id = $this->id.'--u';

			//$timeframe = '-5 hours';
			//$key = 'player_projected_stats_'.$player_id.'_'.str_replace('-', '', str_replace(' ', '_', $timeframe));
			//Cache::delete($key);
			
			$row_data = $this->userProjectedStatsForSport($user_id, $sport_id, null, null, true, $player_id);
			//debug($row_data);
			
			if($schedule_id == 0){
				
				$key = 'sport_projected_stats_'.$sport_id.'_0_';
				Cache::delete($key);
								
			}else{

				$has_player = false;
				$position_id = $row_data[0]['Player']['position_id'];
				$key = 'sport_user_projected_stats_'.$sport_id.'_'.$position_hashtag.'_'.$user_id;

				Cache::set(array('duration' => '+24 hours'));
				$user_projected_stats = Cache::read($key);

				//debug($user_projected_stats);
				//debug($game_stat_id);
				//exit;
				
				if(!empty($user_projected_stats)){

					$projected_data = array();
					foreach($user_projected_stats as $projected_stat){
						//debug($projected_stat);
						
						if($projected_stat['ProjectedStat']['id'] == $game_stat_id){
							
							$has_player = true;
							
							$data_stat = $projected_stat;
							if($row_data[0]['ProjectedStat']['fp'] > 1){
						
	                            $projected_data[] = $row_data[0];

	                         }
							
						}else{
							$projected_data[] = $projected_stat;
						}	
					}


					if(!$has_player){
						$projected_data = array_merge($projected_data, $row_data);
					}
				
					Cache::write($key, $projected_data);
					
				}
			}
			
			$stats = array();
			$stats = $row_data[0];
			$stats['Column']['name'] = $column_name;
			$stats['Column']['id'] = $this->id;
			//$stats['Column']['date'] = date('m/d', strtotime($next_matchup[0]['date'])) . ($next_matchup[0]['home_away'] == 'away'? ' @ ' : ' vs. ') . $next_matchup['AgainstTeam']['hashtag'];
			$stats['Columns'] = $columns;
			
			
			return $stats;

			
		}else{
			return false;
		}


	}
	
}
?>
