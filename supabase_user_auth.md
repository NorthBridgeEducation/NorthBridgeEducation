Admin নতুন Candidate তৈরি করলে matching verified Auth user থাকলে link হবে।



Auth user পরে Google Sign up করলে existing Candidate link হবে।



Admin Candidate email পরিবর্তন করলে নতুন verified email match খুঁজবে।



নতুন email-এর Auth user না থাকলে auth_user_id NULL থাকবে।



একই Auth user-কে একাধিক Candidate-এর সঙ্গে link করার চেষ্টা হবে না।