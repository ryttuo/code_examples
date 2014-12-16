<?php
// Users controller.
class UserProjectedStatsController extends AppController {

	// Declare local variables.
	public $name = 'UserProjectedStats';
	
	public function __construct($id = false, $table = null, $ds = null) {
		parent::__construct($id, $table, $ds);
		$this->ProjectedStat = ClassRegistry::init('PlayerDb.ProjectedStat');
		$this->GameStat = ClassRegistry::init('PlayerDb.GameStat');
		$this->Salary = ClassRegistry::init('Salary');
		$this->Site = ClassRegistry::init('Site');
	}

	//private function to sort array
	private function __compareFeaturedProjectedScore($a, $b){
		return $b['ProjectedStat']['fp'] > $a['ProjectedStat']['fp'];
	}
	
	//edit user projected stat by use_id, spor_id, site_id and  position_id
	function edit($user_id = null, $sport_id = null, $site_id = 2, $position_id = null){
		$sites_ids = array(2, 9, 12, 15, 18, 19, 20);

		if (!$sport_id) {
			if (date('n') < 4) {
				$sports_id = 3;
			} else if (date('n') < 8) {
				$sport_id = 2;
			} else {
				$sport_id = 1;
			}
		}

		
		if ($user_id != $this->Session->read('Auth.User.id')){
			$this->redirect('/');
		}


		if($this->data){
			
			unset($this->data['Stat']);

				$valid_keys = array('weight', 'status', 'player_id', 'overridden_fp', 'pool');
				
				$save_data = array();
				$save_salaries = array();
				foreach ($this->data['ProjectedStat'] as $key => &$stats) {
					$data = array();
					if(strpos($key, "--u") !== false) {
						list($valid_key, $nothing) = explode('--', $key);
						$data['id'] = $valid_key;
					}	
					$data['user_id'] = $user_id;
					foreach ($stats as $key_val => $stat) {
						
						//if($key_val == 'weight' || $key_val == 'status' || $key_val == 'player_id'){
						if(in_array($key_val, $valid_keys)) {
							$data[$key_val] = (is_array($stat))?$stat['player-status']:$stat;
							
						}else if($key_val == 'Salaries'){
							$salary_data = array();
							foreach ($stat as $site_id_player_id => $salary) {
								
								list($player_id, $site_id) =  explode('<-->' ,$site_id_player_id);
								$salary_data['player_id'] = $player_id;
								$salary_data['site_id'] = $site_id; 
								$salary_data['salary'] = $salary;
								$salary_saved = $this->Salary->salaryForPlayerSite($player_id, $site_id);
								$salary_data['id'] = $salary_saved['Salary']['id'];
								$save_salaries[] = $salary_data;
								
							}
							
						}else if($key_val != 'hashtag' && $key_val != 'position_id'){
							$stat_number = $this->GameStat->getStatNumber($sport_id, $key_val, $stats['hashtag']);
							$data[$stat_number] = $stat;
						}
					}

					$save_data[] = $data;
				}
				
				$saved = true;
				
				if(!empty($save_data) && !$this->UserProjectedStat->saveAll($save_data)){
					$saved = false;
				}

				if($saved){
					$this->Session->setFlash('Stats have been updated!', 'default', array('class' => 'success'));
				}else{
					$this->Session->setFlash('Stats could not be updated!', 'default', array('class' => 'error'));
				}

				
				
				foreach ($sites_ids as $site) {
					$this->UserProjectedStat->updateCache($this->data, $sport_id, $site);
				}

		}
		
		$userProjectedStatsTotal = array();
    	$positions = $this->Site->getPositionsForSport($site_id, $sport_id);
    	
    	$position_id = ($position_id == null)?$positions[0]['PositionValues']['id']:$position_id;
    	$pos_hash = $positions[0]['PositionValues']['position'];
    	
    	$upsGameStats = array();
    	$psGameStats = array();	
    	
    	foreach ($positions as $position):
    	
    		$position_hashtag = $position['PositionValues']['position'];
    		$position_data_id = $position['PositionValues']['id'];
    		
    		$keys = $this->ProjectedStat->getKeysBySport($sport_id, $position_hashtag, 'ProjectedStat');
    		$keys = array_merge($keys, array('ProjectedStat.dollar-point' => '$/Point', 'ProjectedStat.fp' => 'FP'));
    		
    		$projstatsGameStats = $this->ProjectedStat->projectedStatsForSport($sport_id, $position_hashtag, $site_id);
    		$userProjstatsGameStats = $this->UserProjectedStat->userProjectedStatsForSport($user_id, $sport_id, $position_hashtag, $site_id);
    		
    		$result = array_merge($userProjstatsGameStats, $projstatsGameStats);
    		$uniqueProjected = array_reduce($result, function($final, $article){
    		
	    		static $seen = array();
	    		
	    		if ( ! array_key_exists($article['Player']['id'], $seen)) {
	        		$seen[$article['Player']['id']] = NULL;
	        		$final[] = $article;
	    		}	
	    		
	    		return $final;
			});

			$uniqueProjected = array_filter($uniqueProjected, function($row) use ($site_id){

				if(!empty($row['Sites']['site_id_'.$site_id])){
					return (intval($row['Sites']['site_id_'.$site_id]) > 0);
				}
				
			});

    		
    		usort($uniqueProjected, array('UserProjectedStatsController', '__compareFeaturedProjectedScore'));
    		$data = array('Position_id' => "table-stats-{$position_data_id}", 'Keys' => $keys, 'ProjectedStats' => $uniqueProjected);

    		$psGameStats[] = $data;
    		
    	endforeach;
    	
		$sites = Configure::read('Globals.sites');
		$positions_by_sport = array();
		foreach ($sites as $site_data_id => $site_name) {
			$positions_sport  = $this->UserProjectedStat->allPositionsSite($site_data_id, $sport_id);
			$cap = $this->UserProjectedStat->getCap($site_data_id, $sport_id);
			$positions_data = array();
			$positions_data['id'] = $site_data_id;
			$positions_data['name'] = $site_name;
			$positions_data['positions'] = $positions_sport;
			$positions_data['cap'] = $cap;
			$positions_by_sport[] = $positions_data;

		}
		
		$defaultPositions = $this->UserProjectedStat->allPositionsSite($site_id, $sport_id);
		

    	$userProjectedStatsTotal = $psGameStats;
    	
    	if(!in_array($site_id, $sites_ids)){
    		$this->Session->setFlash('Site not valid.', 'default', array('class' => 'warning'));
			$this->redirect(array('action' => "edit/{$user_id}/{$sport_id}"));
    	}

    	$this->loadModels('Site', 'Sport');
    	$sport_name = Sport::nameForId($sport_id);
    	$sport_name = ($sport_name == 'Football')?'NFL':$sport_name;
    	$this->set('positions_by_sport', $positions_by_sport);
    	$this->set(compact('userProjectedStatsTotal', 'positions', 'defaultPositions'));
		$this->set('sport_id', $sport_id);
		$this->set('sport_name' , $sport_name);
		$this->set('position_id', $position_id);
		$this->set('position_hashtag', $pos_hash);
		$this->set('site_id', $site_id);
		$this->set('site_name', Site::nameForId($site_id));
		$this->set('sites_ids', $sites_ids);


		$this->set('position_hashtag', $pos_hash);
		$this->set('user_id', $user_id);
		
	}
	
	//update stat go to model->updateStatField()
	public function update_stat(){

		if (!empty($this->data['UserProjectedStat']) && !empty($this->data['Position']) && !empty($this->data['League'])) {
			$data = $this->UserProjectedStat->updateStatField($this->data);
			
			$this->set('data', $data);
		}
	}

	//get player stats from $this->data
	public function player_stats(){

		if (!empty($this->data)) {
			$user_id = $this->Session->read('Auth.User.id');
			$player_id = $this->data['Player']['id'];
			$sport_id = $this->data['Player']['sport_id'];
			$site_id = $this->data['Player']['site_id'];
			$data = $this->UserProjectedStat->userProjectedStatsForSport($user_id, $sport_id, null, $site_id, true, $player_id);
			if (empty($data)){
				$data_tmp = $this->ProjectedStat->projectedStatsForSport($sport_id, null, $site_id, true, $player_id);
				$data = $data_tmp[0];
			}else {
				$data = $data[0];
			}
			$data = (empty($data))?'no-data':$data;
			$this->set('data', $data);
		}
	}

	//just a function to test data for projected stats
	public function test($user_id = null, $sport_id = null, $position_id = null){

		
		$this->layout = NULL;
        $this->autoRender = false;
        Configure::write('debug', 1);

        $data = array();

        $data['User']['id'] = '12097';
		$data['UserProjectedStat']['id'] = '1825';
		$data['Position']['columns'][0]['name'] = 'ip';
		$data['Position']['columns'][0]['val'] = '8';
		$data['Position']['columns'][1]['name'] = 'w';
		$data['Position']['columns'][1]['val'] = '0.54';
		$data['Position']['columns'][2]['name'] = 'l';
		$data['Position']['columns'][2]['val'] = '0.18';
		$data['Position']['columns'][3]['name'] = 'era';
		$data['Position']['columns'][3]['val'] = '0';
		$data['Position']['columns'][4]['name'] = 'sv';
		$data['Position']['columns'][4]['val'] = '0';
		$data['Position']['columns'][5]['name'] = 'k';
		$data['Position']['columns'][5]['val'] = '20.55';
		$data['Position']['columns'][6]['name'] = 'qs';
		$data['Position']['columns'][6]['val'] = '0';
		$data['Position']['columns'][7]['name'] = 'cg';
		$data['Position']['columns'][7]['val'] = '0';
		$data['Position']['columns'][8]['name'] = 'ha';
		$data['Position']['columns'][8]['val'] = '5.08';
		$data['Position']['columns'][9]['name'] = 'bb';
		$data['Position']['columns'][9]['val'] = '1.22';
		$data['Position']['columns'][10]['name'] = 'whip';
		$data['Position']['columns'][10]['val'] = '0.82';
		$data['League']['id'] = '2';
		$data['Position']['hashtag'] = 'SP';
		$data['Position']['id'] = '6';
		$data['Column']['name'] = 'ip';

		//debug($data);
		
		//$lolo = $this->UserProjectedStat->updateStatField($data);
		//debug($lolo);
		//$this->GameStat = ClassRegistry::init('PlayerDb.GameStat');
		//debug($this->GameStat->nextMatchup('10908'));
		$data = array();
		$data['Player']['id'] = '11605';
		$data['Player']['sport_id'] = 1;


		//$lolo = $this->player_stats($data);
		//debug($lolo);

		$data = $this->UserProjectedStat->userProjectedStatsForSport(12097, 3, null, 2, true, 1501);

		///debug($data);

		$data1 = $this->ProjectedStat->projectedStatsForSport(3, null, 2, true, 1501);
		//debug($data1);

		//$row_data = $this->userProjectedStatsForSport('12097', '1', null, null, true, '11605');
		//debug($row_data);

		//debug(date('I'));

		//debug((date('I') ? -5 : -4));

		//debug(strtotime('-5 hours'));


		
	}

}
?>
