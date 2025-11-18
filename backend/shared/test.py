import requests
import json
from datetime import date, time, datetime
import random
import time as time_module

# Configuration
BASE_URL = "http://localhost"  # Change if your nginx is on different host/port
USER_ENDPOINT = f"{BASE_URL}/user"
PLAYER_ENDPOINT = f"{BASE_URL}/player"
SESSION_ENDPOINT = f"{BASE_URL}/session"
TURN_ENDPOINT = f"{BASE_URL}/turn"
PITCH_ENDPOINT = f"{BASE_URL}/pitch"
TOKEN_ENDPOINT = f"{BASE_URL}/token"

# Session for cookie management
session = requests.Session()

# Storage for created entities
user_id = None
players = {}
session_id = None
current_pitcher_id = None
pitcher_switch_count = 0

# Dominican player names (realistic roster)
DOMINICAN_PLAYERS = [
    # Pitchers (8)
    {"first_name": "Juan", "last_name": "Rodriguez", "position": "P", "birth_date": "2005-03-15", "height": "6'2\"", "weight": "195", "throw": "right", "bat": "right", "city": "Santo Domingo"},
    {"first_name": "Carlos", "last_name": "Martinez", "position": "P", "birth_date": "2004-07-22", "height": "6'0\"", "weight": "185", "throw": "right", "bat": "right", "city": "Santiago"},
    {"first_name": "Miguel", "last_name": "Santos", "position": "P", "birth_date": "2005-11-08", "height": "6'3\"", "weight": "210", "throw": "left", "bat": "left", "city": "La Romana"},
    {"first_name": "Luis", "last_name": "Garcia", "position": "P", "birth_date": "2004-05-30", "height": "5'11\"", "weight": "175", "throw": "right", "bat": "right", "city": "San Pedro de Macorís"},
    {"first_name": "Jose", "last_name": "Fernandez", "position": "P", "birth_date": "2005-09-14", "height": "6'1\"", "weight": "190", "throw": "right", "bat": "right", "city": "Puerto Plata"},
    {"first_name": "Rafael", "last_name": "Torres", "position": "P", "birth_date": "2004-12-03", "height": "6'4\"", "weight": "205", "throw": "left", "bat": "left", "city": "Santo Domingo"},
    {"first_name": "Pedro", "last_name": "Alvarez", "position": "P", "birth_date": "2005-01-20", "height": "6'0\"", "weight": "180", "throw": "right", "bat": "right", "city": "Santiago"},
    {"first_name": "Francisco", "last_name": "Mendez", "position": "P", "birth_date": "2004-08-17", "height": "6'2\"", "weight": "195", "throw": "right", "bat": "right", "city": "La Vega"},
    
    # Catchers (2)
    {"first_name": "Roberto", "last_name": "Perez", "position": "C", "birth_date": "2005-04-25", "height": "5'10\"", "weight": "200", "throw": "right", "bat": "right", "city": "Santo Domingo"},
    {"first_name": "Manuel", "last_name": "Cruz", "position": "C", "birth_date": "2004-10-11", "height": "5'11\"", "weight": "195", "throw": "right", "bat": "switch", "city": "San Cristóbal"},
    
    # Infielders (8)
    {"first_name": "Enrique", "last_name": "Morales", "position": "1B", "birth_date": "2005-06-18", "height": "6'1\"", "weight": "220", "throw": "right", "bat": "left", "city": "Santo Domingo"},
    {"first_name": "Alejandro", "last_name": "Vargas", "position": "2B", "birth_date": "2004-02-28", "height": "5'9\"", "weight": "170", "throw": "right", "bat": "switch", "city": "Santiago"},
    {"first_name": "Diego", "last_name": "Herrera", "position": "SS", "birth_date": "2005-08-05", "height": "5'10\"", "weight": "175", "throw": "right", "bat": "right", "city": "San Pedro de Macorís"},
    {"first_name": "Andres", "last_name": "Jimenez", "position": "3B", "birth_date": "2004-11-22", "height": "6'0\"", "weight": "195", "throw": "right", "bat": "right", "city": "La Romana"},
    {"first_name": "Ricardo", "last_name": "Diaz", "position": "1B", "birth_date": "2005-03-09", "height": "6'2\"", "weight": "215", "throw": "right", "bat": "left", "city": "Santo Domingo"},
    {"first_name": "Fernando", "last_name": "Ramos", "position": "2B", "birth_date": "2004-07-16", "height": "5'8\"", "weight": "165", "throw": "right", "bat": "switch", "city": "Puerto Plata"},
    {"first_name": "Sergio", "last_name": "Ortega", "position": "SS", "birth_date": "2005-12-01", "height": "5'11\"", "weight": "180", "throw": "right", "bat": "right", "city": "Santiago"},
    {"first_name": "Victor", "last_name": "Castillo", "position": "3B", "birth_date": "2004-04-14", "height": "6'1\"", "weight": "190", "throw": "right", "bat": "right", "city": "La Vega"},
    
    # Outfielders (7)
    {"first_name": "Marco", "last_name": "Silva", "position": "OF", "birth_date": "2005-05-27", "height": "6'0\"", "weight": "185", "throw": "right", "bat": "left", "city": "Santo Domingo"},
    {"first_name": "Antonio", "last_name": "Rivera", "position": "OF", "birth_date": "2004-09-19", "height": "5'11\"", "weight": "180", "throw": "right", "bat": "right", "city": "San Pedro de Macorís"},
    {"first_name": "Eduardo", "last_name": "Mendoza", "position": "OF", "birth_date": "2005-01-08", "height": "6'1\"", "weight": "190", "throw": "right", "bat": "switch", "city": "La Romana"},
    {"first_name": "Gabriel", "last_name": "Navarro", "position": "OF", "birth_date": "2004-06-23", "height": "5'10\"", "weight": "175", "throw": "right", "bat": "left", "city": "Santiago"},
    {"first_name": "Hector", "last_name": "Vega", "position": "OF", "birth_date": "2005-10-15", "height": "6'2\"", "weight": "195", "throw": "right", "bat": "right", "city": "Puerto Plata"},
    {"first_name": "Oscar", "last_name": "Medina", "position": "OF", "birth_date": "2004-03-31", "height": "5'9\"", "weight": "170", "throw": "right", "bat": "switch", "city": "Santo Domingo"},
    {"first_name": "Pablo", "last_name": "Suarez", "position": "OF", "birth_date": "2005-07-12", "height": "6'0\"", "weight": "185", "throw": "right", "bat": "right", "city": "La Vega"},
]

# Pitch types and results for realistic game simulation
PITCH_TYPES = ["FB", "CB", "CH", "SL"]
PITCH_RESULTS = ["ball", "strike_call", "swing_miss", "foul", "hit", "out", "walk", "hbp"]

def print_step(step, message):
    print(f"\n{'='*60}")
    print(f"STEP {step}: {message}")
    print(f"{'='*60}")

def create_user():
    """Step 1: Create user account"""
    print_step(1, "Creating User Account")
    
    user_data = {
        "first_name": "Scout",
        "last_name": "Manager",
        "email": "scout@dbacks.com",
        "password": "password123"
    }
    
    response = session.post(f"{USER_ENDPOINT}/create", json=user_data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        user = response.json()
        global user_id
        user_id = user["id"]
        print(f"✓ User created: {user['first_name']} {user['last_name']} (ID: {user_id})")
        return True
    else:
        # User might already exist, try to continue
        error_text = response.text
        print(f"⚠ Warning: {error_text}")
        if "duplicate" in error_text.lower() or "already exists" in error_text.lower() or response.status_code == 500:
            print("  User may already exist, continuing with login...")
            return True  # Continue to login
        print(f"✗ Error: {error_text}")
        return False

def login_user():
    """Step 2: Login user"""
    print_step(2, "Logging In User")
    
    # First create a token
    print("  Creating token...")
    response = session.post(f"{TOKEN_ENDPOINT}/create")
    if response.status_code != 200:
        print(f"✗ Error creating token: {response.text}")
        return False
    
    token_obj = response.json()
    token_id = token_obj["id"]
    print(f"  ✓ Token created (ID: {token_id})")
    
    # Now login with the token
    login_data = {
        "email": "scout@dbacks.com",
        "password": "password123",
        "token": token_id  # Use the created token ID instead of empty string
    }
    
    response = session.post(f"{USER_ENDPOINT}/login", json=login_data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print("✓ User logged in successfully")
        # Try to get user info to set user_id
        try:
            user_response = session.get(f"{USER_ENDPOINT}/")
            if user_response.status_code == 200:
                user_info = user_response.json()
                global user_id
                user_id = user_info.get("id")
                if user_id:
                    print(f"  User ID: {user_id}")
        except Exception as e:
            print(f"  Warning: Could not retrieve user ID: {e}")
        return True
    else:
        print(f"✗ Error: {response.text}")
        return False

def create_players():
    """Step 3: Create full roster of Dominican players"""
    print_step(3, "Creating Dominican Player Roster")
    
    global players
    created_count = 0
    
    for i, player_data in enumerate(DOMINICAN_PLAYERS, 1):
        player_payload = {
            "first_name": player_data["first_name"],
            "last_name": player_data["last_name"],
            "position": player_data["position"],
            "date_of_birth": player_data["birth_date"],
            "height": player_data["height"],
            "weight": player_data["weight"],
            "throw": player_data["throw"],
            "bat": player_data["bat"],
            "birth_city": player_data["city"]
        }
        
        response = session.post(f"{PLAYER_ENDPOINT}/create", json=player_payload)
        
        if response.status_code == 200:
            player = response.json()
            player_id = player["id"]
            players[player_id] = {
                "name": f"{player_data['first_name']} {player_data['last_name']}",
                "position": player_data["position"],
                "id": player_id
            }
            created_count += 1
            print(f"  [{i}/{len(DOMINICAN_PLAYERS)}] ✓ {player_data['first_name']} {player_data['last_name']} ({player_data['position']})")
        else:
            print(f"  [{i}/{len(DOMINICAN_PLAYERS)}] ✗ Error creating {player_data['first_name']} {player_data['last_name']}: {response.text}")
    
    print(f"\n✓ Created {created_count}/{len(DOMINICAN_PLAYERS)} players")
    return created_count > 0

def create_session():
    """Step 4: Create game session"""
    print_step(4, "Creating Game Session")
    
    today = date.today().isoformat()
    session_data = {
        "session_date": today
    }
    
    response = session.post(f"{SESSION_ENDPOINT}/create", json=session_data)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        session_obj = response.json()
        global session_id
        session_id = session_obj["id"]
        print(f"✓ Session created: {session_obj['session_date']} (ID: {session_id})")
        return True
    else:
        print(f"✗ Error: {response.text}")
        return False

def get_pitchers():
    """Get all pitcher IDs"""
    return [pid for pid, p in players.items() if p["position"] == "P"]

def get_batters():
    """Get all non-pitcher IDs"""
    return [pid for pid, p in players.items() if p["position"] != "P"]

def switch_pitcher():
    """Switch to a new pitcher"""
    global current_pitcher_id, pitcher_switch_count
    
    pitchers = get_pitchers()
    if not pitchers:
        return None
    
    # Get a different pitcher
    available_pitchers = [p for p in pitchers if p != current_pitcher_id]
    if not available_pitchers:
        available_pitchers = pitchers
    
    current_pitcher_id = random.choice(available_pitchers)
    pitcher_switch_count += 1
    print(f"  🔄 Pitcher Switch #{pitcher_switch_count}: {players[current_pitcher_id]['name']}")
    return current_pitcher_id

def simulate_at_bat(batter_id, inning, at_bat_num):
    """Simulate a single at-bat (turn)"""
    global current_pitcher_id
    
    # Initialize pitcher if needed
    if current_pitcher_id is None:
        pitchers = get_pitchers()
        current_pitcher_id = random.choice(pitchers)
    
    # Create turn
    now = datetime.now()
    turn_data = {
        "session_id": session_id,
        "batter_id": batter_id,
        "pitcher_id": current_pitcher_id,
        "start_time": now.time().isoformat()
    }
    
    response = session.post(f"{TURN_ENDPOINT}/create", json=turn_data)
    if response.status_code != 200:
        print(f"    ✗ Error creating turn: {response.text}")
        return None
    
    turn = response.json()
    turn_id = turn["id"]
    
    batter_name = players[batter_id]["name"]
    pitcher_name = players[current_pitcher_id]["name"]
    print(f"    At-Bat #{at_bat_num}: {batter_name} vs {pitcher_name}")
    
    # Simulate pitches - backend handles count tracking
    pitch_count = 0
    outcome = None
    max_pitches = 20  # Safety limit to prevent infinite loops
    
    while outcome is None and pitch_count < max_pitches:
        # Get current turn state to check count
        response = session.get(f"{TURN_ENDPOINT}/{turn_id}")
        if response.status_code != 200:
            print(f"      ✗ Error getting turn: {response.text}")
            break
        
        current_turn = response.json()
        balls = current_turn.get("balls", 0)
        strikes = current_turn.get("strikes", 0)
        is_complete = current_turn.get("is_complete", False)
        
        # If turn is already complete, break
        if is_complete:
            outcome = current_turn.get("outcome", "unknown")
            print(f"      → {outcome.upper()}")
            break
        
        pitch_count += 1
        
        # Determine pitch result based on current count
        if balls == 3:
            # 3-0, 3-1, 3-2 counts - more likely to be a ball
            result_weights = {
                "ball": 0.5, "strike_call": 0.15, "swing_miss": 0.1,
                "foul": 0.1, "hit": 0.1, "out": 0.05
            }
        elif strikes == 2:
            # 2-strike count - more likely to be strike or foul
            result_weights = {
                "ball": 0.1, "strike_call": 0.2, "swing_miss": 0.2,
                "foul": 0.3, "hit": 0.15, "out": 0.05
            }
        else:
            # Normal count
            result_weights = {
                "ball": 0.25, "strike_call": 0.2, "swing_miss": 0.15,
                "foul": 0.15, "hit": 0.15, "out": 0.1
            }
        
        pitch_result = random.choices(
            list(result_weights.keys()),
            weights=list(result_weights.values())
        )[0]
        
        # Select pitch type (more fastballs)
        pitch_type_weights = {"FB": 0.5, "CB": 0.2, "CH": 0.15, "SL": 0.15}
        pitch_type = random.choices(
            list(pitch_type_weights.keys()),
            weights=list(pitch_type_weights.values())
        )[0]
        
        # Generate release speed based on pitch type
        speed_ranges = {
            "FB": (88, 95),
            "CB": (72, 78),
            "CH": (78, 84),
            "SL": (82, 88)
        }
        min_speed, max_speed = speed_ranges[pitch_type]
        release_speed = round(random.uniform(min_speed, max_speed), 1)
        
        # Create pitch
        pitch_data = {
            "turn_id": turn_id,
            "pitch_type": pitch_type,
            "pitch_result": pitch_result,
            "release_speed": release_speed
        }
        
        response = session.post(f"{PITCH_ENDPOINT}/add", json=pitch_data)
        if response.status_code != 200:
            print(f"      ✗ Error adding pitch: {response.text}")
            break
        
        pitch = response.json()
        
        # Get updated turn to check new count and completion
        response = session.get(f"{TURN_ENDPOINT}/{turn_id}")
        if response.status_code == 200:
            updated_turn = response.json()
            balls = updated_turn.get("balls", 0)
            strikes = updated_turn.get("strikes", 0)
            is_complete = updated_turn.get("is_complete", False)
            outcome = updated_turn.get("outcome")
            
            print(f"      Pitch #{pitch_count}: {pitch_type} @ {release_speed}mph → {pitch_result} ({balls}-{strikes})")
            
            if is_complete and outcome:
                print(f"      → {outcome.upper()}")
        else:
            print(f"      Pitch #{pitch_count}: {pitch_type} @ {release_speed}mph → {pitch_result}")
        
        # Small delay for realism
        time_module.sleep(0.1)
    
    # Safety check - if we hit max pitches, mark as complete
    if pitch_count >= max_pitches and outcome is None:
        print(f"      ⚠ Reached max pitch limit ({max_pitches}), ending at-bat")
        outcome = "max_pitches"
    
    # Mark end time
    mark_time_data = {"mark_time": datetime.now().time().isoformat()}
    session.post(f"{TURN_ENDPOINT}/{turn_id}/mark", json=mark_time_data)
    
    return outcome

def check_and_switch_pitcher():
    """Check pitch count and switch pitcher if needed"""
    global current_pitcher_id
    
    if not current_pitcher_id:
        return
    
    try:
        response = session.get(
            f"{PITCH_ENDPOINT}/session/{session_id}/pitcher/{current_pitcher_id}/count"
        )
        if response.status_code == 200:
            pitch_count = response.json()["total_pitches"]
            
            # Switch pitchers at 50, 100, 150 pitches (3 switches total)
            if pitch_count >= 50 and pitcher_switch_count == 0:
                switch_pitcher()
            elif pitch_count >= 100 and pitcher_switch_count == 1:
                switch_pitcher()
            elif pitch_count >= 150 and pitcher_switch_count == 2:
                switch_pitcher()
    except Exception as e:
        print(f"    Warning: Could not check pitch count: {e}")

def simulate_inning(inning_num, at_bats_per_inning=3):
    """Simulate a single inning"""
    print(f"\n  INNING {inning_num}")
    print(f"  {'-'*50}")
    
    batters = get_batters()
    outcomes = []
    
    for i in range(at_bats_per_inning):
        # Check for pitcher switch before each at-bat
        check_and_switch_pitcher()
        
        batter_id = random.choice(batters)
        outcome = simulate_at_bat(batter_id, inning_num, i + 1)
        if outcome:
            outcomes.append(outcome)
    
    return outcomes

def simulate_game():
    """Step 5: Simulate 9 innings of baseball"""
    print_step(5, "Simulating 9 Innings of Baseball")
    
    global current_pitcher_id
    pitchers = get_pitchers()
    current_pitcher_id = random.choice(pitchers)
    print(f"  Starting Pitcher: {players[current_pitcher_id]['name']}")
    
    all_outcomes = []
    
    for inning in range(1, 10):
        # Vary at-bats per inning (3-6 is realistic)
        at_bats = random.randint(3, 6)
        outcomes = simulate_inning(inning, at_bats)
        all_outcomes.extend(outcomes)
        
        # Small delay between innings
        time_module.sleep(0.2)
    
    print(f"\n  ✓ Game Complete!")
    print(f"  Total At-Bats: {len(all_outcomes)}")
    print(f"  Pitcher Switches: {pitcher_switch_count}")
    
    # Get final pitch counts for all pitchers
    print(f"\n  Final Pitch Counts:")
    for pitcher_id in get_pitchers():
        response = session.get(
            f"{PITCH_ENDPOINT}/session/{session_id}/pitcher/{pitcher_id}/count"
        )
        if response.status_code == 200:
            count_data = response.json()
            print(f"    {players[pitcher_id]['name']}: {count_data['total_pitches']} pitches")

def end_session():
    """Step 6: End the session"""
    print_step(6, "Ending Game Session")
    
    response = session.post(f"{SESSION_ENDPOINT}/{session_id}/end")
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        print("✓ Session ended successfully")
        return True
    else:
        print(f"✗ Error: {response.text}")
        return False

def main():
    """Run the complete test flow"""
    print("\n" + "="*60)
    print("BASEBALL GAME SIMULATION TEST")
    print("="*60)
    
    try:
        # Step 1: Create user
        if not create_user():
            return
        
        # Step 2: Login
        if not login_user():
            return
        
        # Step 3: Create players
        if not create_players():
            return
        
        # Step 4: Create session
        if not create_session():
            return
        
        # Step 5: Simulate game
        simulate_game()
        
        # Step 6: End session
        end_session()
        
        print("\n" + "="*60)
        print("TEST COMPLETE!")
        print("="*60)
        
    except Exception as e:
        print(f"\n✗ Test failed with error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()