$(document).ready(function(){

	paper.install(window);
	paper.setup("game");

	function start_level() {

		let sprite_width = 40;
		let sprite_height = 60;

		let finish_this_level = false;

		let piglets_position_cords_x_array = [];
		let piglets_position_cords_y_array = [];

		let person_speed = 3;
		let speedboat_engine = false;

		let creatures = {};
		let save_piglets = {};
		let save_piglets_anim = {};
		let save_piglets_count = 0;

		let Sprite = paper.Group.extend({
		    _class: 'Sprite',
		    initialize: function Sprite(url, size, portion) {
		       	this.maskSize = size || new paper.Size(sprite_width, sprite_height);
		        this.portion = portion;
		        var that = this;
		        
		        if (portion) {
		            this._spriteSheetWidth = portion.width / that.maskSize.width;
		            this._spriteSheetHeight = portion.height / that.maskSize.height;
		        }

		        this._raster = new paper.Raster(url);
		        this._raster.pivot = new paper.Point();
		        this._raster.on('load', function () {
		            if (!portion) {
		                this.pivot = this.bounds.topLeft;
		            	  that._spriteSheetWidth = this.size.width / that.maskSize.width;
		                that._spriteSheetHeight = this.size.height / that.maskSize.height;
		            } else {
		                this.pivot = this.bounds.topLeft.add(portion.topLeft);
		            }
		            that.setIndex(that._spriteIndex || 0);
		        });
		        this._clipRect = new paper.Path.Rectangle(new paper.Point(), this.maskSize);

		        Sprite.base.call(this, [this._clipRect, this._raster]);
		        // Just use a blank point if you want the position to be in the corner
		        this.pivot = new paper.Point();
		        this.applyMatrix = false;

		        this.clipped = true;
		    },

		    setIndex: function (index) {
		        if (typeof this._spriteSheetWidth !== "undefined") {
		        		var column = index % this._spriteSheetWidth;
		        		var row = (index - column) / this._spriteSheetWidth;
		            this._raster.position = new paper.Point(
		            	- column * this.maskSize.width,
		              - row * this.maskSize.height
		            );
		        }
		        return this._spriteIndex = index;
		    },
		    
		    getIndex: function () {
		        return this._spriteIndex;
		    },
		    
		    maxIndex: function () {
		    	  if (typeof this._spriteSheetWidth !== "undefined") {
		        		return (this._spriteSheetWidth * this._spriteSheetHeight) - 1;
		        }
		        return null;
		    },
		    
		    next: function () {
		        var i = this._spriteIndex + 1;
		        if (i > this.maxIndex()) {
		            return this.setIndex(0);
		        }
		        return this.setIndex(i);
		    }
		});

		function randIntExcep(min, max, exp) {
		    var n, exp = Array.isArray(exp) ? exp : [(isNaN(exp) ? min-1 : exp)];
		    while(true){
		        n = Math.floor(Math.random() * (max - min + 1)) + min;
		        if(exp.indexOf(n) < 0) return n;
		    }
		}

		function getRandomInt(min, max) {
			return Math.floor(Math.random() * (max - min)) + min;
		}

		function saving_piglet(id, piglet_id, path_along_hypotenuse_from_this_creature_to_next_creature_x, path_along_hypotenuse_from_this_creature_to_next_creature_y) {

			this.id = id;
			this.piglet_id = piglet_id;

			this.path_along_hypotenuse_from_this_creature_to_next_creature_x = path_along_hypotenuse_from_this_creature_to_next_creature_x;
			this.path_along_hypotenuse_from_this_creature_to_next_creature_y = path_along_hypotenuse_from_this_creature_to_next_creature_y;

			if((creatures[0].object.position.x + (this.path_along_hypotenuse_from_this_creature_to_next_creature_x * 50)) >= this.id.object.position.x-20
				&& (creatures[0].object.position.x + (this.path_along_hypotenuse_from_this_creature_to_next_creature_x * 50)) <= this.id.object.position.x+20
				&& (creatures[0].object.position.y + (this.path_along_hypotenuse_from_this_creature_to_next_creature_y * 50)) >= this.id.object.position.y-20
				&& (creatures[0].object.position.y + (this.path_along_hypotenuse_from_this_creature_to_next_creature_y * 50)) <= this.id.object.position.y+20) {

				if(this.id.piglet_swims_away.visible == false) {

					if (this.id.not_saved_piglet_anim.visible == true) {
						this.id.not_saved_piglet_anim.visible = false;
					}

					let isset_piglet = 0;
					for(let i in save_piglets) {
						
						if(save_piglets[i] == piglet_id) {
							isset_piglet++;
							break;
						}

						if(isset_piglet == 0 && save_piglets[i] == 'none') {

							isset_piglet++;
							save_piglets[i] = piglet_id;
							save_piglets_count++;

							this.id.object.visible = true;
							this.id.object.source = '/images/little_games/beach_lifeguard/pig_2.svg';
							
							this.id.saved_id = save_piglets_count;
							this.id.object_line_to_next_object.visible = true;

							let f = creatures[piglet_id].saved_id - 1;
							let creatures_id = save_piglets[f];
							let distance = 15;

							if(creatures[piglet_id].saved_id == 1) {
								creatures_id = 0;
								distance = 25;
							}

							this.nextCreature_x = creatures[creatures_id].object.position.x;
							this.nextCreature_y = creatures[creatures_id].object.position.y;

							this.path_along_hypotenuse_from_this_creature_to_next_creature_x = creatures[creatures_id].path_along_hypotenuse_from_this_creature_to_next_creature_x;
							this.path_along_hypotenuse_from_this_creature_to_next_creature_y = creatures[creatures_id].path_along_hypotenuse_from_this_creature_to_next_creature_y;

							this.id.object.position.x = this.nextCreature_x - (this.path_along_hypotenuse_from_this_creature_to_next_creature_x * person_speed * distance);
							this.id.object.position.y = this.nextCreature_y - (this.path_along_hypotenuse_from_this_creature_to_next_creature_y * person_speed * distance);

							if(save_piglets_count == 15) {
								let audio_swim_to_the_bridge_number = getRandomInt(1, 3);

								if(audio_swim_to_the_bridge_number == 1) {
									audio_swim_to_the_bridge_1.play();
								}
								else if(audio_swim_to_the_bridge_number == 2) {
									audio_swim_to_the_bridge_2.play();
								}
							}

							break;
						}
					}
				}
			}
		}

		function collision_with_others(this_id, other_id, path_along_hypotenuse_from_this_creature_to_next_creature_x, path_along_hypotenuse_from_this_creature_to_next_creature_y) {

			this.this_id = this_id;
			this.other_id = other_id;

			this.path_along_hypotenuse_from_this_creature_to_next_creature_x = path_along_hypotenuse_from_this_creature_to_next_creature_x;
			this.path_along_hypotenuse_from_this_creature_to_next_creature_y = path_along_hypotenuse_from_this_creature_to_next_creature_y;

			let min_id = 0;
			let next = false;

			if(this.other_id != undefined && (this.this_id.object.position.x + (this.path_along_hypotenuse_from_this_creature_to_next_creature_x * 25)) >= this.other_id.object.position.x-15
				&& (this.this_id.object.position.x + (this.path_along_hypotenuse_from_this_creature_to_next_creature_x * 25)) <= this.other_id.object.position.x+15
				&& (this.this_id.object.position.y + (this.path_along_hypotenuse_from_this_creature_to_next_creature_y * 25)) >= this.other_id.object.position.y-15
				&& (this.this_id.object.position.y + (this.path_along_hypotenuse_from_this_creature_to_next_creature_y * 25)) <= this.other_id.object.position.y+15) {

				if((this.this_id.type == 'piglet' && this.this_id.saved_id != 0 && this.this_id.piglet_swims_away_now == false && this.other_id.type == 'piglet' && this.other_id.saved_id != 0  && this.other_id.piglet_swims_away_now == false)
					|| (this.this_id.type == 'person' && this.other_id.type == 'piglet' && this.other_id.saved_id != 0 && this.other_id.piglet_swims_away_now == false)) {

					if(this.this_id.type == 'piglet') {
						if(this.this_id.saved_id < this.other_id.saved_id) {
							min_id = this.this_id.saved_id;
						}else {
							min_id = this.other_id.saved_id;
						}
					}else {
						min_id = this.other_id.saved_id;
					}

					next = true;
				}
			}
			else if(((this.this_id.object.position.x + (this.path_along_hypotenuse_from_this_creature_to_next_creature_x * 10)) >= bridge_hitbox.position.x-90
				&& (this.this_id.object.position.x + (this.path_along_hypotenuse_from_this_creature_to_next_creature_x * 10)) <= bridge_hitbox.position.x+90
				&& (this.this_id.object.position.y + (this.path_along_hypotenuse_from_this_creature_to_next_creature_y * 10)) >= bridge_hitbox.position.y-40
				&& (this.this_id.object.position.y + (this.path_along_hypotenuse_from_this_creature_to_next_creature_y * 10)) <= bridge_hitbox.position.y+40) ||
				((this.this_id.object.position.x + (this.path_along_hypotenuse_from_this_creature_to_next_creature_x * 10)) >= sand.position.x-40
				&& (this.this_id.object.position.x + (this.path_along_hypotenuse_from_this_creature_to_next_creature_x * 10)) <= sand.position.x+40
				&& (this.this_id.object.position.y + (this.path_along_hypotenuse_from_this_creature_to_next_creature_y * 10)) >= sand.position.y-530
				&& (this.this_id.object.position.y + (this.path_along_hypotenuse_from_this_creature_to_next_creature_y * 10)) <= sand.position.y+530)) {

				if(this.this_id.type == 'piglet' && this.this_id.saved_id != 0 && this.this_id.piglet_swims_away_now == false) {
					min_id = this.this_id.saved_id;

					next = true;
				}
			}

			if(next == true) {

				let audio_piglets_in_the_water_number = getRandomInt(1, 4);

				if(audio_piglets_in_the_water_number == 1) {
					audio_piglets_in_the_water_1.play();
				}
				else if(audio_piglets_in_the_water_number == 2) {
					audio_piglets_in_the_water_2.play();
				}
				else if(audio_piglets_in_the_water_number == 3) {
					audio_piglets_in_the_water_3.play();
				}

				for(let i in save_piglets) {

					if(i >= min_id && save_piglets[i] != 'none') {

						creatures[save_piglets[i]].saved_id = 0;
						creatures[save_piglets[i]].object.visible = false;

						let creature_source = '/images/little_games/beach_lifeguard/pig_1.svg';
						let creature_size_width = 40;
						let creature_size_height = 40;

						let position_x = creatures[save_piglets[i]].object.position.x;
						let position_y = creatures[save_piglets[i]].object.position.y;

						creatures[save_piglets[i]].object = new Raster({
							source: creature_source,
							position: new Point(position_x, position_y),
							size: new Size(creature_size_width, creature_size_height),
							visible: false
						});
						//creatures[save_piglets[i]].object.scale(1.25);

						creatures[save_piglets[i]].angle = 0;

						creatures[save_piglets[i]].object_line_to_next_object.visible = false;
						creatures[save_piglets[i]].object_line_to_next_object.segments[0].point.x = 0;
						creatures[save_piglets[i]].object_line_to_next_object.segments[0].point.y = 0;
						creatures[save_piglets[i]].object_line_to_next_object.segments[1].point.x = 0;
						creatures[save_piglets[i]].object_line_to_next_object.segments[1].point.y = 0;

						creatures[save_piglets[i]].nextCreature_x = randIntExcep(creatures[save_piglets[i]].min_x, creatures[save_piglets[i]].max_x, piglets_position_cords_x_array);
						creatures[save_piglets[i]].nextCreature_y = randIntExcep(creatures[save_piglets[i]].min_y, creatures[save_piglets[i]].max_y, piglets_position_cords_y_array);

						creatures[save_piglets[i]].piglet_swims_away.visible = true;
						creatures[save_piglets[i]].piglet_swims_away_now = true;

						let this_object = save_piglets[i];

						save_piglets[i] = 'none';
						save_piglets_count = save_piglets_count - 1;
					}
				}

				game_layer.children = [
					creatures[1].object,
					creatures[2].object,
					creatures[3].object,
					creatures[4].object,
					creatures[5].object,
					creatures[6].object,
					creatures[7].object,
					creatures[8].object,
					creatures[9].object,
					creatures[10].object,
					creatures[11].object,
					creatures[12].object,
					creatures[13].object,
					creatures[14].object,
					creatures[15].object,
					creatures[0].object,
					sea_hitbox,
					bridge_hitbox,
				];
			}
		}

		function sleep(ms) {
			return new Promise(resolve => setTimeout(resolve, ms));
		}

		function not_saved_piglet_anim() {
			if(finish_this_level == false) {
				let next_anim_start = getRandomInt(4000, 5000);
				sleep(next_anim_start).then(() => {
					let next_id = false;
					let next_anim_piglet_id = 0;
					let anim_not_saved_piglet = false;

					while(next_id == false) {

						next_anim_piglet_id = getRandomInt(1, 16);

						let count_piglet_swims_away = 0;
						for(let i = 1; i <= 15; i++) {
							if(creatures[i].piglet_swims_away.visible == true){
								count_piglet_swims_away++;
							}
						}

						if(save_piglets_count == 15 || count_piglet_swims_away == 15 || save_piglets_count+count_piglet_swims_away == 15) {
							next_id = true;
						}
						else if(creatures[next_anim_piglet_id].saved_id == 0 && creatures[next_anim_piglet_id].piglet_swims_away.visible == false) {

							anim_not_saved_piglet = true;

							creatures[next_anim_piglet_id].object.visible = false;
							creatures[next_anim_piglet_id].not_saved_piglet_anim.visible = true;

							let audio_not_saved_piglet_number = getRandomInt(1, 4);

							if(audio_not_saved_piglet_number == 1) {
								creatures[next_anim_piglet_id].audio_not_saved_piglet_1.play();
							}
							else if(audio_not_saved_piglet_number == 2) {
								creatures[next_anim_piglet_id].audio_not_saved_piglet_2.play();
							}
							else if(audio_not_saved_piglet_number == 3) {
								creatures[next_anim_piglet_id].audio_not_saved_piglet_3.play();
							}

							next_id = true;
						}

						if(next_id == true) {
							if(finish_this_level == false) {
								let next_anim_start = getRandomInt(3500, 4000);
								sleep(next_anim_start).then(() => {
									if(anim_not_saved_piglet == true && finish_this_level == false) {
										creatures[next_anim_piglet_id].not_saved_piglet_anim.visible = false;
										creatures[next_anim_piglet_id].object.visible = true;
									}
									not_saved_piglet_anim();
								});
							}
						}
					}
				});
			}
		}

		function finish_level() {
			if((creatures[0].object.position.x + (creatures[0].path_along_hypotenuse_from_this_creature_to_next_creature_x * 10)) >= bridge_hitbox.position.x-155
				&& (creatures[0].object.position.x + (creatures[0].path_along_hypotenuse_from_this_creature_to_next_creature_x * 10)) <= bridge_hitbox.position.x+155
				&& (creatures[0].object.position.y + (creatures[0].path_along_hypotenuse_from_this_creature_to_next_creature_y * 10)) >= bridge_hitbox.position.y-85
				&& (creatures[0].object.position.y + (creatures[0].path_along_hypotenuse_from_this_creature_to_next_creature_y * 10)) <= bridge_hitbox.position.y+85) {

				if(save_piglets_count == 15) {

					speedboat_engine = false;
					sea_hitbox.visible = false;
					bridge_hitbox.visible = false;

					let f = 100;

					for(let i = 15;i >= 1;i--) {

						sleep(f).then(() => {
							creatures[save_piglets[i]].save_piglet_anim.visible = true;
							creatures[save_piglets[i]].object.visible = false;
							creatures[save_piglets[i]].object_line_to_next_object.visible = false;

							save_piglets_anim[i] = creatures[save_piglets[i]].id;
						});

						f = f+100;
					}

					let audio_end_number = getRandomInt(1, 3);

					if(audio_end_number == 1) {
						audio_end_1.play();
					}
					else if(audio_end_number == 2) {
						audio_end_2.play();
					}

					sleep(2200).then(() => {

						let f = 100;

						for(let i = 15;i >= 1;i--) {
							sleep(f).then(() => {
								creatures[i].save_piglet_anim.visible = false;
							});

							f = f+100;
						}
					});

					finish_this_level = true;

					sleep(4000).then(() => {
						clearInterval(interval_1);
						clearInterval(interval_2);
						$('#game_menu').css('display', 'block');
						creatures[0].object.source = location_background.source = '';
						location_background = creatures = game_layer = audio_start_1 = audio_start_2 = audio_start_3 = audio_piglets_in_the_water_1 = audio_piglets_in_the_water_2 = audio_piglets_in_the_water_3 = audio_swim_to_the_bridge_1 = audio_swim_to_the_bridge_2 = audio_end_1 = audio_end_2 = audio_start_1 = audio_start_2 = audio_start_3 = audio_piglets_in_the_water_1 = audio_piglets_in_the_water_2 = audio_piglets_in_the_water_3 = audio_swim_to_the_bridge_1 = audio_swim_to_the_bridge_2 = audio_end_1 = audio_end_2 = undefined;
					});
				}
			}
		}

		class Creature {
			constructor(id, type, min_x = 0, max_x = 0, min_y = 0, max_y = 0) {
				this.id = id;
				this.type = type;

				this.min_x = min_x;
				this.max_x = max_x;
				this.min_y = min_y;
				this.max_y = max_y;

				let creature_source = '/images/little_games/beach_lifeguard/pig_1.svg';
				let creature_size_width = 40;
				let creature_size_height = 40;

				if(this.type == 'person') {
					creature_source = '/images/little_games/beach_lifeguard/person.svg';
					creature_size_width = 80;
					creature_size_height = 50;
				}

				if(this.type == 'piglet') {
					this.audio_the_piglet_plops_into_the_water = new Audio('/images/little_games/beach_lifeguard/the_piglet_plops_into_the_water.mp3');

					this.audio_not_saved_piglet_1 = new Audio('/images/little_games/beach_lifeguard/not_saved_piglet_1.mp3');
					this.audio_not_saved_piglet_2 = new Audio('/images/little_games/beach_lifeguard/not_saved_piglet_2.mp3');
					this.audio_not_saved_piglet_3 = new Audio('/images/little_games/beach_lifeguard/not_saved_piglet_3.mp3');

					this.object_line_to_next_object = new Path.Line({
						from: [0, 0],
						to: [0, 0],
						strokeColor: 'black',
						visible: false
					});

					this.piglet_swims_away = new Raster({
						source: '/images/little_games/beach_lifeguard/piglet_swims_away.svg',
						position: new Point(0, 0),
						size: new Size(creature_size_width, creature_size_height),
						visible: false
					});

					sprite_height = 60;
					this.save_piglet_anim = window.sprite = new Sprite();
					this.save_piglet_anim.children[1].source = '/images/little_games/beach_lifeguard/saved_piglet_anim.svg';
					this.save_piglet_anim.children[0].segments[3]._point._x = 40;
					this.save_piglet_anim.children[0].segments[3]._point._y = 60;
					this.save_piglet_anim.matrix._tx = 200;
					this.save_piglet_anim.matrix._ty = 100;
					this.save_piglet_anim.visible = false;

					this.save_piglet_anim.position.x = randIntExcep(20, 265, piglets_position_cords_x_array);
					this.save_piglet_anim.position.y = randIntExcep(-10, 8, piglets_position_cords_y_array);

					this.piglet_swims_away_now = false;

					//this.audio_the_piglet_plops_into_the_water = new Audio('/images/little_games/beach_lifeguard/the_piglet_plops_into_the_water.mp3');
					//this.audio_the_piglet_plops_into_the_water.src = '/images/little_games/beach_lifeguard/the_piglet_plops_into_the_water.mp3';
				}

				this.object = new Raster({
					source: creature_source,
					position: new Point(930, 0),
					size: new Size(creature_size_width, creature_size_height),
					visible: true
				});

				if(this.type == 'person') {
					this.person_point = new Path.Rectangle(new Rectangle(new Point(10, 10), new Point(0, 0)));
					this.person_point.visible = false;
				}

				if(this.type == 'person') {
					this.object.position.x = 170;
					this.object.position.y = 140;
				}else {
					this.nextCreature_x = randIntExcep(this.min_x, this.max_x, piglets_position_cords_x_array);
					this.nextCreature_y = randIntExcep(this.min_y, this.max_y, piglets_position_cords_y_array);

					sprite_height = 40;
					this.not_saved_piglet_anim = window.sprite = new Sprite();
					this.not_saved_piglet_anim.children[1].source = '/images/little_games/beach_lifeguard/pig_1_anim.svg';
					this.not_saved_piglet_anim.children[0].segments[3]._point._x = 40;
					this.not_saved_piglet_anim.children[0].segments[3]._point._y = 40;
					this.not_saved_piglet_anim.matrix._tx = 0;
					this.not_saved_piglet_anim.matrix._ty = 0;
					this.not_saved_piglet_anim.visible = false;

					this.piglet_swims_away_now = true;
					this.piglet_swims_away.visible = true;
					this.object.visible = false;

					let i_x = this.object.position.x-20;
					let i_y = this.object.position.y-20;

					let next = false;

					while(i_x <= this.object.position.x+20) {
						piglets_position_cords_x_array.push(i_x);

						i_x++;
					}
					/*while(i_y <= this.object.position.y+20) {
						piglets_position_cords_y_array.push(i_y);

						i_y++;
					}*/
				}

				this.status = 'not_saved';
				this.saved_id = 0;

				this.angle = 0;
			}

			movementToNextCreature() {

				if(this.type != 'person' && this.piglet_swims_away_now == false) {
					let i = this.saved_id - 1;

					if(this.saved_id == 1) {
						this.nextCreature_x = creatures[0].person_point.position.x;
						this.nextCreature_y = creatures[0].person_point.position.y;
					}else {
						this.nextCreature_x = creatures[save_piglets[i]].object.position.x;
						this.nextCreature_y = creatures[save_piglets[i]].object.position.y;
					}
				}

				this.path_from_this_creature_to_next_creature_x = this.nextCreature_x - this.object.position.x;
				this.path_from_this_creature_to_next_creature_y = this.nextCreature_y - this.object.position.y;

				this.path_along_hypotenuse_from_this_creature_to_next_creature_x = this.path_from_this_creature_to_next_creature_x
					/ Math.sqrt(Math.pow(this.path_from_this_creature_to_next_creature_x, 2)
					+ Math.pow(this.path_from_this_creature_to_next_creature_y, 2));

				this.path_along_hypotenuse_from_this_creature_to_next_creature_y = this.path_from_this_creature_to_next_creature_y
					/ Math.sqrt(Math.pow(this.path_from_this_creature_to_next_creature_x, 2)
					+ Math.pow(this.path_from_this_creature_to_next_creature_y, 2));

				if(this.type != 'person') {

					if(this.piglet_swims_away_now == false) {
						this.object.rotate(-(this.angle), this.object.bottomCenter);
						this.angle = (Math.atan2(this.object.position.y - this.nextCreature_y, this.object.position.x - this.nextCreature_x) * 180) / Math.PI;
						this.object.rotate((this.angle), this.object.bottomCenter);
					
						this.object_line_to_next_object.segments[0].point.x = this.object.position.x;
						this.object_line_to_next_object.segments[0].point.y = this.object.position.y;

						if(this.saved_id == 1) {
							this.object_line_to_next_object.segments[1].point.x = this.nextCreature_x + (this.path_along_hypotenuse_from_this_creature_to_next_creature_x * person_speed * 2);
							this.object_line_to_next_object.segments[1].point.y = this.nextCreature_y + (this.path_along_hypotenuse_from_this_creature_to_next_creature_y * person_speed * 2);
						}else {
							this.object_line_to_next_object.segments[1].point.x = this.nextCreature_x - (this.path_along_hypotenuse_from_this_creature_to_next_creature_x * person_speed * 6);
							this.object_line_to_next_object.segments[1].point.y = this.nextCreature_y - (this.path_along_hypotenuse_from_this_creature_to_next_creature_y * person_speed * 6);
						}
					}else {
						this.piglet_swims_away.rotate(5);
					}
				}

				this.remaining_path_this_creature_to_next_creature_x = Math.abs(this.object.position.x - this.nextCreature_x);
				this.remaining_path_this_creature_to_next_creature_y = Math.abs(this.object.position.y - this.nextCreature_y);

				let distance = 45;

				if(this.type != 'person' && this.piglet_swims_away_now == true) {
					distance = 15;
				}

				if(this.remaining_path_this_creature_to_next_creature_x > distance || this.remaining_path_this_creature_to_next_creature_y > distance) {
					this.object.position.x = this.object.position.x + (this.path_along_hypotenuse_from_this_creature_to_next_creature_x * person_speed);
					this.object.position.y = this.object.position.y + (this.path_along_hypotenuse_from_this_creature_to_next_creature_y * person_speed);

					if(this.type != 'person') {
						this.piglet_swims_away.position.x = this.object.position.x;
						this.piglet_swims_away.position.y = this.object.position.y;
					}

					if(this.type == 'person') {
						this.person_point.position.x = this.object.position.x - (this.path_along_hypotenuse_from_this_creature_to_next_creature_x * person_speed * 10);
						this.person_point.position.y = this.object.position.y - (this.path_along_hypotenuse_from_this_creature_to_next_creature_y * person_speed * 10);
					
						for(let i = 1; i <= 15; i++) {
							saving_piglet(creatures[i], i, this.path_along_hypotenuse_from_this_creature_to_next_creature_x, this.path_along_hypotenuse_from_this_creature_to_next_creature_y);
						}
					}

					for(let i = 0; i <= 15; i++) {
						if(i != this.id) {
							collision_with_others(this, creatures[i], this.path_along_hypotenuse_from_this_creature_to_next_creature_x, this.path_along_hypotenuse_from_this_creature_to_next_creature_y);
						}
					}
				}
				else if(this.type != 'person' && this.piglet_swims_away_now == true && (this.remaining_path_this_creature_to_next_creature_x <= distance || this.remaining_path_this_creature_to_next_creature_y <= distance)) {

					this.piglet_swims_away.position.x = this.nextCreature_x;
					this.piglet_swims_away.position.y = this.nextCreature_y;

					this.object.position.x = this.piglet_swims_away.position.x;
					this.object.position.y = this.piglet_swims_away.position.y;

					this.audio_the_piglet_plops_into_the_water.play();

					this.piglet_swims_away.visible = false;
					this.object.visible = true;
					this.piglet_swims_away_now = false;

					this.not_saved_piglet_anim.position.x = this.object.position.x-20;
					this.not_saved_piglet_anim.position.y = this.object.position.y-20;
				}
			}
		}

		let location_background = new Raster({
			source: '/images/little_games/beach_lifeguard/background.svg',
			position: new Point(465, 265)
		});

		for(let i = 1; i <= 15; i++) {

			if(i == 6 || i == 11 || i == 16) {
				piglets_position_cords_x_array = [];
				piglets_position_cords_y_array = [];
			}

			if(i <= 5) {
				creatures[i] = new Creature(i, 'piglet', 340, 900, 30, 170);

				//creatures[i].object.scale(1.25);
				//creatures[i].piglet_swims_away.scale(1.25);
				//creatures[i].not_saved_piglet_anim.scale(1.25);
			}
			else if(i > 5 && i <= 10) {
				creatures[i] = new Creature(i, 'piglet', 130, 300, 215, 500);

				//creatures[i].object.scale(1.25);
				//creatures[i].piglet_swims_away.scale(1.25);
				//creatures[i].not_saved_piglet_anim.scale(1.25);
			}
			else if(i > 10 && i <= 15) {
				creatures[i] = new Creature(i, 'piglet', 330, 900, 215, 500);

				//creatures[i].object.scale(1.25);
				//creatures[i].piglet_swims_away.scale(1.25);
				//creatures[i].not_saved_piglet_anim.scale(1.25);
			}

			if(i < 16) {
				save_piglets[i] = 'none';
				save_piglets_anim[i] = 'none';
			}
		}
		creatures[0] = new Creature(0, 'person');
		//creatures[0].object.scale(1.25);

		let sea_hitbox = new Path.Rectangle(new Rectangle(new Point(100, 0), new Size(830, 530)), new Size(10, 10));
		sea_hitbox.fillColor = 'rgba(0,0,0,0.00001)';
		sea_hitbox.strokeColor = 'rgba(0,0,0,0.00001)';

		let bridge_hitbox = new Path.Rectangle(new Rectangle(new Point(100, 0), new Size(215, 85)), new Size(10, 10));
		bridge_hitbox.fillColor = 'rgba(0,0,0,0.00001)';
		bridge_hitbox.strokeColor = 'rgba(0,0,0,0.00001)';

		let sand = new Path.Rectangle(new Rectangle(new Point(0, 0), new Size(85, 530)), new Size(5, 5));
		sand.fillColor = 'rgba(0,0,0,0.00001)';
		sand.strokeColor = 'rgba(0,0,0,0.00001)';

		let game_layer = new Layer({});
		game_layer.children = [
			creatures[1].object,
			creatures[2].object,
			creatures[3].object,
			creatures[4].object,
			creatures[5].object,
			creatures[6].object,
			creatures[7].object,
			creatures[8].object,
			creatures[9].object,
			creatures[10].object,
			creatures[11].object,
			creatures[12].object,
			creatures[13].object,
			creatures[14].object,
			creatures[15].object,
			creatures[0].object,
			sea_hitbox,
			bridge_hitbox,
		];

		sea_hitbox.onClick = function start_speedboat_engine(e) {

			if(speedboat_engine == false) {
				speedboat_engine = true;
			}
		}

		sea_hitbox.onMouseMove = function path_from_person_to_mouse(e) {

			if(speedboat_engine == true) {
				creatures[0].nextCreature_x = e.point.x;
				creatures[0].nextCreature_y = e.point.y;

				creatures[0].object.rotate(-(creatures[0].angle), creatures[0].object.bottomCenter);
				creatures[0].angle = (Math.atan2(creatures[0].object.position.y - creatures[0].nextCreature_y, creatures[0].object.position.x - creatures[0].nextCreature_x) * 180) / Math.PI;
				creatures[0].object.rotate((creatures[0].angle), creatures[0].object.bottomCenter);
			}
		}

		let audio_start_1 = new Audio('/images/little_games/beach_lifeguard/start_1.mp3');
		let audio_start_2 = new Audio('/images/little_games/beach_lifeguard/start_2.mp3');
		let audio_start_3 = new Audio('/images/little_games/beach_lifeguard/start_3.mp3');

		let audio_piglets_in_the_water_1 = new Audio('/images/little_games/beach_lifeguard/piglets_in_the_water_1.mp3');
		let audio_piglets_in_the_water_2 = new Audio('/images/little_games/beach_lifeguard/piglets_in_the_water_2.mp3');
		let audio_piglets_in_the_water_3 = new Audio('/images/little_games/beach_lifeguard/piglets_in_the_water_3.mp3');

		let audio_swim_to_the_bridge_1 = new Audio('/images/little_games/beach_lifeguard/swim_to_the_bridge_1.mp3');
		let audio_swim_to_the_bridge_2 = new Audio('/images/little_games/beach_lifeguard/swim_to_the_bridge_2.mp3');

		let audio_end_1 = new Audio('/images/little_games/beach_lifeguard/end_1.mp3');
		let audio_end_2 = new Audio('/images/little_games/beach_lifeguard/end_2.mp3');

		sleep(1000).then(() => {

			let audio_start_number = getRandomInt(1, 4);

			if(audio_start_number == 1) {
				audio_start_1.play();
			}
			else if(audio_start_number == 2) {
				audio_start_2.play();
			}
			else if(audio_start_number == 3) {
				audio_start_3.play();
			}
		});

		sleep(8000).then(() => {
			not_saved_piglet_anim();
		});

		sleep(10000).then(() => {
			not_saved_piglet_anim();
		});

		sleep(14000).then(() => {
			not_saved_piglet_anim();
		});

		sleep(18000).then(() => {
			not_saved_piglet_anim();
		});

		let interval_1 = setInterval(function(){

			if(finish_this_level == false) {
				for(let i in creatures) {
					if(creatures[i].type != 'person' && (creatures[i].saved_id != 0 || creatures[i].piglet_swims_away_now == true)) {
						creatures[i].movementToNextCreature();
					}
				}
				creatures[0].movementToNextCreature();

				finish_level();
			}
		}, 20);

		let interval_2 = setInterval(function(){
			
			for(let i = 1;i <= 15;i++) {
				if(save_piglets_anim[i] != 'none') {
					creatures[save_piglets_anim[i]].save_piglet_anim.next();
				}

				if(creatures[i].not_saved_piglet_anim.visible == true) {
					creatures[i].not_saved_piglet_anim.next();
				}
			}
		}, 80);
	}

	$('#start_game').click(function(){
		start_level();
		$('#game_menu').css('display', 'none');
		//document.getElementById("game").requestFullscreen();
	});
});