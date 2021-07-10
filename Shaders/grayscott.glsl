uniform int timer;
uniform vec2 resolution;
uniform vec2 mouse;
uniform sampler2D start;
uniform sampler2D texture;

vec2 pos;
vec2 texColor;
vec2 offset;

uniform float dA;
uniform float dB;
uniform float kill;
uniform float feed;
uniform float dT;

vec2 getLaplace() {
    vec2 offset = vec2( 1.0 ) / resolution;
    vec2 pos0 = pos + vec2( -offset.x,  -offset.y );
    vec2 pos1 = pos + vec2(       0.0,  -offset.y );
    vec2 pos2 = pos + vec2(  offset.x,  -offset.y );
    vec2 pos3 = pos + vec2( -offset.x,        0.0 );
    vec2 pos4 = pos + vec2(       0.0,        0.0 );
    vec2 pos5 = pos + vec2(  offset.x,        0.0 );
    vec2 pos6 = pos + vec2( -offset.x,   offset.y );
    vec2 pos7 = pos + vec2(       0.0,   offset.y );
    vec2 pos8 = pos + vec2(  offset.x,   offset.y );

    vec2 col0 = texture2D( texture, pos0 ).rg;
    vec2 col1 = texture2D( texture, pos1 ).rg;
    vec2 col2 = texture2D( texture, pos2 ).rg;
    vec2 col3 = texture2D( texture, pos3 ).rg;
    vec2 col4 = texture2D( texture, pos4 ).rg;
    vec2 col5 = texture2D( texture, pos5 ).rg;
    vec2 col6 = texture2D( texture, pos6 ).rg;
    vec2 col7 = texture2D( texture, pos7 ).rg;
    vec2 col8 = texture2D( texture, pos8 ).rg;

    return col0 * 0.05 + col1 * 0.2 + col2 * 0.05 +
            col3 * 0.2  - col4 * 1.0 + col5 * 0.2  +
            col6 * 0.05 + col7 * 0.2 + col8 * 0.05;
}

float map(float value) {
    return .052 + (value / 1.6 + .5) * 0.018;
}

float sdGyroid(vec2 p, float scale) {
    vec3 p3 = vec3(p * scale, 0.);
    float d = dot(sin(p3), cos(p3.yzx) );
    d *= .4;
    d += .3;
    return d;
}

float killFunction(vec2 position) {
    // return ;
    return map(sdGyroid(position, .1));
}

void main(){
    pos = gl_FragCoord.xy / resolution;
    vec2 pos_gyroid = (gl_FragCoord.xy - vec2(timer)) / resolution;

    vec2 color;

    if( timer == 1 ) {
        color = vec2( 1.0, step( 0.1, texture2D( start, pos ).g ) * 0.3 );
    }
    else {
        vec2 texColor = texture2D( texture, pos ).rg;
        offset = vec2( 1.0 ) / resolution;

        float a = texColor.r;
        float b = texColor.g;

        if( mouse.x > 5.0 && mouse.x < resolution.x - 5.0 
            && mouse.y > 5.0 && mouse.y < resolution.y - 5.0 ) {
            float diff = length( gl_FragCoord.xy - mouse );
            if( diff < 8.0 ) b = ( 1.0 - smoothstep( 1.0, 8.0, diff ) ) * 0.3;
        }

        float reaction = a * b * b;
        vec2 laplace = getLaplace();
        
        /*float loc_kill = killFunction(gl_FragCoord.xy);

        float red = ( dA * laplace.r ) - reaction + ( feed * ( 1.0 - a ) );
        float green = ( dB * laplace.g ) +  reaction - ( ( loc_kill + feed ) * b );*/

        // Used to observe variations along axis:
        // k varying from 0.045 to 0.07 on horizontal axis, 
        // f varying from 0.01 to 0.05 on vertical axis
        float dVal = sdGyroid(pos_gyroid, 10.);
        float k = 0.045 + dVal * 0.025;
        float f = 0.01 + dVal * 0.04;
        float red = ( dA * laplace.r ) - reaction + ( f * ( 1.0 - a ) );
        float green = ( dB * laplace.g ) +  reaction - ( ( k + f ) * b );

        color = texColor + vec2( red, green ) * dT;
        // color = dVal * vec2(1.);

    }

    gl_FragColor = vec4( color, 0.0, 1.0 );
}