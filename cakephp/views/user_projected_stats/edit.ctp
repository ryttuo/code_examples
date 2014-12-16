<?php $static->js('jquery.tablesorter.min', true);   ?>
<?php //$static->js('jquery.fancybox-1.3.4', true);  ?>
<?php $static->css('jquery-ui-1.8.19', true); ?>
<?php //$static->css('projected_stats'); ?>
<?php $static->css('user_projected_stats_edit'); ?>
<?php $static->js('user_projected_stats_edit'); ?>


  
<?php
	
	
	
	//$sites_ids = array(2, 9, 12, 6, 1, 16);
	//$select_sites = array();
	//foreach($sites_ids as $site_data_id):
	//	$select_sites[$site_data_id] = $grinders->siteName($site_data_id);
	//endforeach;	
	
	
	$sports = array(1 => 'football', 2 => 'baseball', 3 => 'basketball');
	$sportNavItem = function($sport_id, $position_id) use ($sports, $user_id) {
		return array('title' => '<span class="' . $sports[$sport_id]  . ' sport-icon"></span>' . ucwords($sports[$sport_id]), 'href' => array('action' => 'edit/'.$user_id, $sport_id), 'attr' => array('id' => 'sportid-' . $sport_id));
	};
	
	$positions_data  = array();
	$positions_ids_data = array();
	foreach($positions as $position_data){
		$positions_data[$position_data['PositionValues']['id']] =  $position_data['PositionValues']['position'];
		$positions_ids[] = $position_data['PositionValues']['id'];
	}
	
	$positionNavItem = function($sport_id, $position_id) use ($positions_data, $user_id){
		return array('title' => '<span class="' . $positions_data[$position_id]  . ' position-icon"></span>' . ucwords($positions_data[$position_id]), 'href' => array('action' => 'edit/'.$user_id, $sport_id, $position_id), 'attr' => array('id' => 'positionid-' . $position_id));
	};
	
	
	$sports_ids = array(1, 3, 2);
	if (date('n') < 4) {
		$sports_ids = array(3, 2, 1);
	} else if (date('n') < 10) {
		$sports_ids = array(2, 1, 3);
	}
 

?>


<header id="screen-header">
	<!--<h1><span><?php //echo date('M, jS'); echo ' '.$site_name; ?> User Projected Stats</span> </h1>-->

	<nav id='lineups-research-nav'>
		<span id="image-preloader" class="hidden"></span>
		<div id="calculate-optimal-lineup">

			<header>
				<span class='line-up-img'></span>
				<h2><?php echo $site_name; echo ' '.$sport_name; ?> Lineup Builder</h2>
				<h3>Create Lineups using your own projections and our "Optimal Lineup" Algorithm!</h3>
			</header>

			<!--<h2>Calculate Optimal Lineup Based on Your Projections</h2>-->
			</br>

			<div class="col-left"><table cellspacing="0" class="fancy" id="optimal-table" width="50%">
				<thead>
					<tr>
						<th class="salary-position">Pos</th>
						<th class="player-first-name">Player Name (Salary/Points)</th>
					</tr>
				</thead>

				<tbody>
					<?php foreach ($defaultPositions as $position):?>
					<?php $abs_position = (is_array($position))?implode(" | ", $position):$position;?>
					<tr id="">
						<td class="salary-position" salary="" projected="" abs-position="<?php echo $abs_position;?>">
							<?php echo $abs_position; ?>
						</td>
						<td class="player-name">
							<span class="fullname"></span>
							<input type="text" placeholder="Add Player" class="player-autocomplete ui-autocomplete-input" id="add-player-optimal" value="" autocomplete="off" role="textbox" aria-autocomplete="list" aria-haspopup="true">
						</td>
					</tr>
					<?php endforeach; ?>
				</tbody>
				<tfoot></tfoot>
			</table>
			<div class="total-values extra-info">
				<div class="left">
					<div id="total-salary"><span>Total Salary: </span><val>$0</val></div>
					<div id="salary-remaining"><span>Salary Remaining: </span><val>$100K</val></div>
				</div>
				<div class="right">
					<div id="avg-player"><span>AVG Per Player: </span><val>$0</val></div>
					<div id="total-fp"><span>Projected Score: </span><val>0</val></div>
				</div>
			</div>
			<!--<div class="dropdown-sites">-->
				<?php //echo $form->input('group', array('label' => false, 'type' => 'select', 'options' => $select_sites, 'div' => false, 'default' => $site_id)); ?>
			<!--</div>-->
			<div class="center-button extra-info">
				<a class="button compact recalculate-optimal">Calculate Optimals</a>
				<a class="button compact pool-optimal">Random Pool Lineup</a>
				<div id="progressbar"></div>
			</div>

		</div>

		<div class="col-right">
			<div class="setup-players">
				<h4>Excluded Players</h4>
				<table cellspacing="0" class="fancy" id="exclude-table" width="50%">
					<thead>
						<tr>
							<th class="salary-position">Pos</th>
							<th class="player-first-name">Player Name (Salary/Points)</th>
						</tr>
					</thead>
					<tbody></tbody>
					<tfoot></tfoot>
				</table>
			</div>

			<div class="setup-players">
				<h4>Locked Players</h4>
				<table cellspacing="0" class="fancy" id="locked-table" width="50%">
					<thead>
						<tr>
							<th class="salary-position">Pos</th>
							<th class="player-first-name">Player Name (Salary/Points)</th>
						</tr>
					</thead>
					<tbody></tbody>
					<tfoot></tfoot>
				</table>
			</div>


		</div>


</div>
<div class="clearer"></div>
		<br/>
		<?php //echo $this->Html->link('Calculate Optimals', '', array('class' => 'button compact optimal', 'id' => 'cal-optimal')); ?>
		<div class="add-player-stats">
			<?php //echo $form->input('player', array('type' => 'text', 'class' => 'player-autocomplete player-input-status', 'placeholder' => 'Select Player', 'value' => '', 'div' => '', 'label' => 'Add Player')); ?>
			<input type="hidden" id="add-player-id" value="">
			<input type="text" placeholder="Add Player" class="player-autocomplete ui-autocomplete-input" id="add-player-stats" value="" autocomplete="off" role="textbox" aria-autocomplete="list" aria-haspopup="true">
			<input type="text" placeholder="Add FP" autocomplete="off" role="textbox" aria-autocomplete="list" aria-haspopup="true" id="add-fp" value="">
			<?php echo $this->Html->link('Add', array('action' => "#"), array('class' => 'button compact', 'id' => 'add-player-button')); ?>
		</div>
		<?php
			
			$projected_sports = array();
			foreach($sports_ids as $sport_data):
				$projected_sports[] = $sportNavItem($sport_data, $sport_id);
			endforeach;
			
			//echo $this->element('widgets/filter_list', array('items' => $projected_sports, 'escape' => false, 'active' => array_search($sport_id, $sports_ids), 'id' => 'research-sports', 'label' => array('tag' => 'h3', 'title' => 'Choose a Sport:'), 'class' => 'simple'));
			  
		?>
		
		<?php
			
			$projected_positions = array();
			foreach($positions_ids as $position_data):
				$projected_positions[] = $positionNavItem($sport_id, $position_data);
			endforeach;		
			
			echo $this->element('widgets/filter_list', array('items' => $projected_positions, 'escape' => false, 'id' => 'research-positions', 'active' => array_search($position_id, $positions_ids), 'label' => array('tag' => 'h2', 'title' => 'Choose a Position:'), 'class' => 'simple'));
			
			
		?>
		
		<?php //echo $form->input('group', array('label' => false, 'type' => 'select', 'options' => $select_sites, 'empty' => false, 'id' => 'select_sites', 'default' => $site_id)); ?>

		<?php 
				/*foreach ($select_sites as $key => $select_site) {
					$site_id = $key;
					break;	
				}*/
		?>
	</nav>
</header>

<div id="player-stats">
	<section>
	<input id="user_id" type=hidden value="<?php echo $user_id; ?>">	
	<input id="league_id" type=hidden value="<?php echo $sport_id; ?>">
	<input id="position_hashtag" type=hidden value="<?php echo $position_hashtag; ?>">
	<input id="position_id" type=hidden value="<?php echo $position_id; ?>">
	<input id="positions_by_sport" type=hidden value='<?php echo 
	$javascript->object($positions_by_sport); ?>'>
	<input id="optimal_players" type=hidden value="">
	<input id="site_id" type=hidden value='<?php echo $site_id;?>'>

	<?php 

		$formatSalary = function($salary) use ($grinders){

			$salary = trim($salary);
			return '10';

		};


		
		$projectedStats_cb = function($item, $path, $row) use ($form, $site_id, $formatSalary){


			switch($path) {
				/*case 'Salaries.site_id_2':
					$salary = (empty($item))?'--':round($item);
					return $form->input("Stat.salary", array('type' => 'text', 'div' => false, 'label' => false, 'value' => $salary, 'id' => 'player-salary'));

					break;*/
				case 'Game.date':
					return date('m/d', strtotime($item)) . ($row['Game']['home_away'] == 'away'? ' @ ' : ' vs. ') . $row['AgainstTeam']['hashtag'];
					break;
				case 'Player.name':
					//return "<span class='add-player'></span>".$row['Player']['name'];
					//break;

					$agains = (!empty($row['Game']['home_away']) && !empty($row['AgainstTeam']['hashtag']))? ($row['Game']['home_away'] == 'away'? ' @ ' : ' vs. ') . $row['AgainstTeam']['hashtag']: '  ----';
					$agains .= "</div>";
					//$date = "<div class='name-date'>" . date('m/d', strtotime($row['Game']['date'])) .' '. $agains;
					$value = ($row['ProjectedStat']['pool'])?'checked':'';
					$pool = $form->input("Stat.pool", array('type' => 'checkbox', 'div' => false, 'label' => false, 'class' => 'pool', 'checked' => $value));
					//$pool = "<input name='data[Stat][mts]' type='text' class='' value="28.86" id='StatMts'>"

					$col_id = $form->input("Stat.player", array('type' => 'hidden', 'value' => $row['Player']['id'], 'id' => 'player-id'));
					$hashtag = $form->input("Stat.hashtag", array('type' => 'hidden', 'id' => 'hashtag-value'));
					$position_id = $form->input("Stat.position_id", array('type' => 'hidden', 'id' => 'position-id-value'));
					return "<span class='add-player'></span><span>{$pool}</span><span class='name'>".$row['Player']['name']." ($".round($row['Salary']['salary']).")</span>".$col_id." ".$hashtag." ".$position_id;
					break;		
				case 'ProjectedStat.fp':
					/*return (!empty($row['Sites']['site_id_'.$site_id]))?
								round($row['Sites']['site_id_'.$site_id], 2):'--';*/
					$overridden_fp = $row['ProjectedStat']['overridden_fp'];
					$value = (!empty($row['Sites']['site_id_'.$site_id]))?
								round($row['Sites']['site_id_'.$site_id], 2):'--';
					if(!empty($overridden_fp) && $overridden_fp > 0) {
						$value_fp = $overridden_fp;
						$class = 'edited-fp';
					}else{
						$value_fp = $value;
						$class = '';
					}
					return $form->input('Stat.fp', array('type' => 'text', 'fp' => $value, 'class' => $class, 'div' => false, 'label' => false, 'value' => $value_fp, 2));
					break;
				case 'ProjectedStat.dollar-point':
				$dpp = ($row['Sites']['site_id_'.$site_id] <= 0 || $row['Salaries']['site_id_'.$site_id] / $row['Sites']['site_id_'.$site_id] < 0) ? '1000000' : $row['Salaries']['site_id_'.$site_id] / $row['Sites']['site_id_'.$site_id];
					return '$'.number_format($dpp, 2);	
					break;
				default:
					list($projectedStat, $nameStat) = explode('.', $path);
					//return $form->input($projectedStat.".".$index.".".$nameStat, array('type' => 'text', 'div' => false, 'label' => false, 'value' => round($item, 2)));
					$class = '';
					$readonly = '';
					if(!empty($row['ProjectedStat']['overridden_fp']) && $row['ProjectedStat']['overridden_fp'] > 0) {
						$class = 'unable';
						$readonly = 'readonly';
					}
					return $form->input('Stat.'.$nameStat, array('type' => 'text', 'class' => $class, 'readonly' => $readonly, 'div' => false, 'label' => false, 'value' => round($item, 2)));
				}

			//return round($item, 2);
		};

		//debug($userProjectedStatsTotal[0]);

		echo $form->create('UserProjectedStat', array('action' => "edit/{$user_id}/{$sport_id}/{$site_id}", 'id' => 'user-projected-stat-form'));

		foreach($userProjectedStatsTotal as $projectedStats):
			
			echo $this->element('table', array(
			//'plugin' 	=> 'global',
			'table_id'	=> $projectedStats['Position_id'],
			'data' 		=> $projectedStats['ProjectedStats'],
			'row_id'  => array('ProjectedStat', 'id'), //assignment every row body id
			'keys' 		=> array('Player.name' => "Player (<a href='#' class=sort-salary>Sort by Salary </a>)", 'Game.date' => 'Date') + $projectedStats['Keys'],
			//'hidden'	=> 'Sites',
			'hidden'	=> array(array('name' => 'Sites', 'id' => 'sites'), 
								 array('name' => 'Formulas', 'id' => 'formulas'),
								 array('name' => 'Salaries', 'id' => 'salaries'),
								 array('name' => 'Positions', 'id' => 'positions'),
								 array('name' => 'AgainstTeam', 'id' => 'opp'),
								 array('name' => 'Player.id', 'id' => 'player_id')
			),
			//'tfoot' => $gameStats_footer,
			'callback' 	=> $projectedStats_cb,
			));

		endforeach;		

		echo $form->end('Save');
			
	?>
	
	</section>
	<footer>
		
		<div id="projected-mask" style="display: none; ">
			    <div id="projected-indicator"></div>
	    </div>
		<?php //echo $this->html->link('Go to Player Profile', '/fantasyplayers/' . Inflector::slug($player['first_name'] . ' ' . $player['last_name']) . '-' . $player['id']) ?>
	</footer>
</div> 

