function stop_audio()
{
    pause();
}

function init_audio(song_id)
{
    var song_name;

    switch (song_id)
    {
        case 'TWINKLE':
            song_name = 'star';
            break;
        case 'FARM':
            song_name = 'old_macdonald';
            break;
        case 'BELLS': 
            song_name = 'frerejacques';
            break;
        case 'SUN': 
            song_name = 'sunshine';
            break;
    }

    // Get file locations
    var file_extension = '.ogg'
    var audio_path = {
        melody : song_name + '_melody' + file_extension,
        drums : song_name + '_drums' + file_extension,
        saxophone : song_name + '_saxophone' + file_extension,
        tambourine : song_name + '_tambourine' + file_extension,
        piano : song_name + '_piano' + file_extension,
        guitar : song_name + '_guitar' + file_extension
    };


    // Create audio context
    var audio_ctx = new (window.AudioContext || window.webkitAudioContext)();

    var song_dir = 'res/raw/';
    audio_parts = {};
    for (var key in audio_path) 
    {
        if (audio_path.hasOwnProperty(key)) 
        {
            // Create audio objects
            audio_parts[key] = new Audio(song_dir + audio_path[key]);
            audio_parts[key].loop = true;
            audio_parts[key].preload = true;

            // Create media element source from object and connect to speaker
            var source = audio_ctx.createMediaElementSource(audio_parts[key]);
            source.connect(audio_ctx.destination);

            // Mute all parts
            audio_parts[key].volume = 0.0;
        }
    }

    audio_parts.melody.volume = 1.0;
}

// Please don't judge me
function sync_audio() 
{
    var targetTime = audio_parts.melody.currentTime;

    audio_parts.piano.currentTime = targetTime;
    audio_parts.guitar.currentTime = targetTime;
    audio_parts.drums.currentTime = targetTime;
    audio_parts.saxophone.currentTime = targetTime;
    audio_parts.tambourine.currentTime = targetTime;
}

function play()
{
    for (var key in audio_parts) 
    {
        if (audio_parts.hasOwnProperty(key)) 
        {
            audio_parts[key].play();
        }
    } 
}

function pause() 
{
    for (var key in audio_parts) 
    {
        if (audio_parts.hasOwnProperty(key)) 
        {
            audio_parts[key].pause();
        }
    }
}

function mute_source(source_id) 
{
    if (audio_parts.hasOwnProperty(source_id))
    {
        audio_parts[source_id].volume = 0;
    }
}

function unmute_source(source_id) 
{
    if (audio_parts.hasOwnProperty(source_id))
    {
        audio_parts[source_id].volume = 1;
    }
}

function toggle_source_volume(source_id)
{
    if (audio_parts.hasOwnProperty(source_id))
    {
        if (audio_parts[source_id].volume == 1) mute_source(source_id);
        else unmute_source(source_id);
    }
}

function main()
{
    (['piano', 'guitar', 'drums', 'saxophone', 'tambourine']).map(hook_instrument_to_div);

    document.getElementById('back').onclick = goto_song_choose;

    document.getElementById('song_1').onclick = () => goto_song_play('TWINKLE');
    document.getElementById('song_2').onclick = () => goto_song_play('FARM');
    document.getElementById('song_3').onclick = () => goto_song_play('BELLS');
    document.getElementById('song_4').onclick = () => goto_song_play('SUN');

}

function goto_song_choose()
{
    turn_backgrounds_white();

    pause();
    delete audio_parts;

    document.getElementById('song_play').classList.add('hidden');
    document.getElementById('song_choose').classList.remove('hidden');    
    
    if (sync_interval) window.clearInterval(sync_interval);
}

function goto_song_play(song_id)
{
    document.getElementById('song_choose').classList.add('hidden');
    document.getElementById('song_play').classList.remove('hidden');    

    init_audio(song_id);

    if (sync_interval == null) sync_interval = window.setInterval(sync_audio, 12000);

    play();
}

function turn_backgrounds_white()
{
    (['piano', 'guitar', 'drums', 'saxophone', 'tambourine']).map(function(instrument)
    {
        var div = document.getElementById(instrument);
        if (div.classList.contains(instrument + '_on')) {
            div.classList.remove(instrument + '_on');
            div.classList.add(instrument);
        }
    })
}

function toggle_background_color(div, instrument)
{
    if (div.classList.contains(instrument)) 
    {
        div.classList.remove(instrument);
        div.classList.add(instrument + '_on');
    }
    else 
    {
        div.classList.remove(instrument + '_on');
        div.classList.add(instrument);
    }
}

var sync_interval = null;

function hook_instrument_to_div(instrument)
{
    document.getElementById(instrument).onclick = function (mouse_event)
    {
        var div = mouse_event.target;
        toggle_source_volume(instrument);
        toggle_background_color(div, instrument);
    };
}

window.onload = main;
