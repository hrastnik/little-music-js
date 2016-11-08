function stop_audio()
{
    pause();
}

var activatedInstruments;
var audioContext = new AudioContext();
var songBuffers = {};
var allInstruments = ['melody', 'piano', 'guitar', 'drums', 'saxophone', 'tambourine'];

function init_audio(song_name)
{
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


    var mixer = audio_ctx.createChannelMerger(6);
    var mixerChannel = 0;

    var song_dir = 'res/raw/';
    audio_parts = {};
    for (var key in audio_path) 
    {
        if (audio_path.hasOwnProperty(key)) 
        {
            // Create audio objects
            audio_parts[key] = new Audio(song_dir + audio_path[key]);
            audio_parts[key].loop = true;
            //audio_parts[key].preload = true;

            // Create media element source from object and connect to speaker
            var source = audio_ctx.createMediaElementSource(audio_parts[key]);
            source.connect(mixer, 0, mixerChannel);
            mixerChannel++;

            // Mute all parts
            audio_parts[key].volume = 0.0;
        }
    }


    mixer.connect(audio_ctx.destination);

    audio_parts.melody.volume = 1.0;
}

function mute_source(source_id) 
{
    var indexOfSource = activatedInstruments.indexOf(source_id);
    if (indexOfSource != -1)
    {
        activatedInstruments.splice(indexOfSource, 1);
    }
}

function unmute_source(source_id) 
{
    var indexOfSource = activatedInstruments.indexOf(source_id);
    if (indexOfSource == -1) {
        activatedInstruments.push(source_id);
    }
}

function main()
{
    (['piano', 'guitar', 'drums', 'saxophone', 'tambourine']).map(hook_instrument_to_div);

    document.getElementById('back').onclick = goto_song_choose;

    document.getElementById('song_1').onclick = () => goto_song_play('star');
    document.getElementById('song_2').onclick = () => goto_song_play('old_macdonald');
    document.getElementById('song_3').onclick = () => goto_song_play('frerejacques');
    document.getElementById('song_4').onclick = () => goto_song_play('sunshine');

}

function goto_song_choose()
{
    turn_backgrounds_white();

    source.stop(0);

    document.getElementById('song_play').classList.add('hidden');
    document.getElementById('song_choose').classList.remove('hidden');    
    
    if (sync_interval) window.clearInterval(sync_interval);
}

function goto_song_play(song_id)
{
    document.getElementById('song_choose').classList.add('hidden');
    document.getElementById('song_play').classList.remove('hidden');    

    document.getElementById('get_ready').classList.remove('hidden');

    activatedInstruments = ['melody'];
    songBuffers = {};
    
    allInstruments.map(instrument =>
    {
        getSongBuffer(song_id, instrument, audioContext)
        .then(buffer =>
        {
            songBuffers[instrument] = buffer;
        
            if (Object.keys(songBuffers).length != 6) return;

            var composedBuffer = composeSong(songBuffers,
                activatedInstruments,
                audioContext);
            
            source = audioContext.createBufferSource();
            source.connect(audioContext.destination);
            source.buffer = composedBuffer;
            source.loop = true;
            source.start(0);
            document.getElementById('get_ready').classList.add('hidden');
        });
    })

    // if (sync_interval == null) sync_interval = window.setInterval(sync_audio, 12000);

    // play();
}

function composeSong(audioBuffers, activatedInstruments, audioContext, existingBuffer)
{
    var arrayLength = audioBuffers.melody.getChannelData(0).length;

    var composedBuffer = audioContext.createBuffer(1, arrayLength, 48000);
    var composedData = composedBuffer.getChannelData(0);
    activatedInstruments.map(instrument =>
    {
        var channelData = audioBuffers[instrument].getChannelData(0);
        
        for (var i = 0;i < arrayLength;i++) 
        {
            composedData[i] += channelData[i];
        }
    });
    
    if (existingBuffer != null)
    {
        existingData = existingBuffer.getChannelData(0);
        for (var i = 0;i < arrayLength;i++)
        {
            existingData[i] = composedData[i];
        }
    }
    
    return composedBuffer;
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

function toggle_source_volume(source_id)
{
    if (activatedInstruments.indexOf(source_id) == -1)
    {
        unmute_source(source_id);
    }
    else 
    {
        mute_source(source_id);
    }

    composeSong(songBuffers, activatedInstruments, audioContext, source.buffer);
}
/*
    songId is one of 
        {'star', 'old_macdonald', 'frerejacques', 'sunshine'}
    instrumentId is one of 
        {'melody', 'drums', 'guitar', 'piano', 'saxophone', 'tambourine'}
*/
function getSongBuffer(songId, instrumentId, audioContext)
{
    return new Promise(function (accept, reject)
    {
        var audioPath = 'res/raw/'
        var audioExtension = '.ogg';
        var resourceLocation = audioPath + songId + '_' + instrumentId + audioExtension;

        var request = new XMLHttpRequest();
        request.open('GET', resourceLocation, true);
        request.responseType = 'arraybuffer';

        request.onload = () => {
            if (request.status != 200 && request.status != 206)
            {
                console.error('Something went wrong');
                console.log(request);
                eee = request;
                reject();
            }
            var audioData = request.response;

            audioContext.decodeAudioData(audioData, (buffer) => {
                accept(buffer);
            });
        }
        request.send();
    });
}

window.onload = main;
