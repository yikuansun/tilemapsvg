svgns = "http://www.w3.org/2000/svg";

velocity_up = 0;
velocity_right = 0;

my_level = `........................................
........................................
........................................
........................................
........................................
........................................
........................................
........#..###..####..#.................
.......##.............##................
.@....#.#.............#.#...............
########################################
########################################`;

function buildPlatform(x, y, width, height) {
    platform = document.createElementNS(svgns, "rect");
    platform.style.fill = "rgb(0, 120, 0)";
    platform.setAttribute("width", width); platform.setAttribute("height", height);
    platform.setAttribute("x", x); platform.setAttribute("y", y);
    scrollelems.appendChild(platform);
    platform.setAttribute("class", "platform");
    platform.setAttribute("id", (x / 40).toString() + "::" + (y / 40).toString());
    return platform;
}

function levelInit(levelstring) {
    document.getElementById("gameframe").style.backgroundColor = "deepskyblue";

    scrollelems = document.createElementNS(svgns, "g");
    document.getElementById("gameframe").appendChild(scrollelems);

    theMatrix = [];
    for (r = 0; r < 12; r++) { theMatrix.push(my_level.split("\n")[r].split("")); };

    for (r = 0; r < theMatrix.length; r++) {
        for (c = 0; c < theMatrix[r].length; c++) {
            if (theMatrix[r][c] == "@") {
                playerRect = document.createElementNS(svgns, "rect");
                playerRect.style.fill = "rgb(0, 20, 100)";
                playerRect.setAttribute("width", 30); playerRect.setAttribute("height", 50);
                playerRect.setAttribute("x", c * 40); playerRect.setAttribute("y", r * 40);
                playerRect.setAttribute("rx", 30 / 2);
                scrollelems.appendChild(playerRect);
            }
            else if (theMatrix[r][c] == "#") {
                buildPlatform(c * 40, r * 40, 40, 40);
            }
        }
    }
}

function touching(rect1, rect2) {
    return !(
        ((parseFloat(rect1.getAttribute("y")) + parseFloat(rect1.getAttribute("height"))) < (parseFloat(rect2.getAttribute("y")))) ||
        (parseFloat(rect1.getAttribute("y")) > (parseFloat(rect2.getAttribute("y")) + parseFloat(rect2.getAttribute("height")))) ||
        ((parseFloat(rect1.getAttribute("x")) + parseFloat(rect1.getAttribute("width"))) < parseFloat(rect2.getAttribute("x"))) ||
        (parseFloat(rect1.getAttribute("x")) > (parseFloat(rect2.getAttribute("x")) + parseFloat(rect2.getAttribute("width"))))
    );
}

function touching_direction(rect1, rect2) {
    rect1_bottom = parseFloat(rect1.getAttribute("y")) + parseFloat(rect1.getAttribute("height"));
    rect2_bottom = parseFloat(rect2.getAttribute("y")) + parseFloat(rect2.getAttribute("height"));
    rect1_right = parseFloat(rect1.getAttribute("x")) + parseFloat(rect1.getAttribute("width"));
    rect2_right = parseFloat(rect2.getAttribute("x")) + parseFloat(rect2.getAttribute("width"));
    b_collision = rect1_bottom - parseFloat(rect2.getAttribute("y"));
    t_collision = rect2_bottom - parseFloat(rect1.getAttribute("y"));
    l_collision = rect1_right - parseFloat(rect2.getAttribute("x"));
    r_collision = rect2_right - parseFloat(rect1.getAttribute("x"));
    if (t_collision < b_collision && t_collision < l_collision && t_collision < r_collision) {
        return "bottom";
    }
    if (b_collision < t_collision && b_collision < l_collision && b_collision < r_collision) {
        return "top";
    }
    if (l_collision < r_collision && l_collision < t_collision && l_collision < b_collision) {
        return "left";
    }
    if (r_collision < l_collision && r_collision < t_collision && r_collision < b_collision) {
        return "right";
    }
}

function detect_platform_collisions() {
    out = {
        touching_top: false,
        touching_bottom: false,
        touching_left: false,
        touching_right: false
    };

    for (c = Math.floor(parseFloat(playerRect.getAttribute("x")) / 40) - 2; c < Math.ceil(parseFloat(playerRect.getAttribute("x")) / 40) + 2; c++) {
        for (r = Math.floor(parseFloat(playerRect.getAttribute("y")) / 40) - 2; r < Math.ceil(parseFloat(playerRect.getAttribute("y")) / 40) + 2; r++) {
            platform = document.getElementById(c.toString() + "::" + r.toString());
            if (platform) {
                if (touching(playerRect, platform)) {
                    collision = touching_direction(playerRect, platform);
                    if (collision == "left") {
                        out.touching_left = true;
                        playerRect.setAttribute("x", parseFloat(platform.getAttribute("x")) - parseFloat(playerRect.getAttribute("width")));
                        velocity_right = 0;
                    }
                    else if (collision == "right") {
                        out.touching_right = true;
                        playerRect.setAttribute("x",  parseFloat(platform.getAttribute("x")) + parseFloat(platform.getAttribute("width")));
                        velocity_right = 0;
                    }
                    else if (collision == "bottom") {
                        out.touching_bottom = true;
                        playerRect.setAttribute("y", parseFloat(platform.getAttribute("y")) + parseFloat(platform.getAttribute("height")));
                    }
                    else if (collision == "top") {
                        out.touching_top = true;
                        playerRect.setAttribute("y", parseFloat(platform.getAttribute("y")) - parseFloat(playerRect.getAttribute("height")));
                    }
                }
            }
        }
    }

    return out;
}

function setscrolling(playerxpos, levelwidth) {
    if ((-(playerxpos - 426)) < 0 && (-(playerxpos - 426)) > -levelwidth + 852) {
        scrollelems.setAttribute("transform", "translate(" + Math.floor(-(playerxpos - 426)).toString() + ", 0)");
    }
    else {
        scrollelems.setAttribute("transform", "translate(" + Math.floor(((-(playerxpos - 426)) > 0)?0:-levelwidth + 852).toString() + ", 0)");
    }
}

map = {};
window.addEventListener("keydown", function(e) {
    map[e.key] = true;
});
window.addEventListener("keyup", function(e) {
    map[e.key] = false;
});

function load() {

    collisions = detect_platform_collisions();

    if (collisions.touching_bottom) {
        velocity_up = -1;
    }
    
    if (!(collisions.touching_top)) {
        velocity_up = velocity_up - 0.5;
    }
    else {
        if (map.x && !(collisions.touching_bottom)) {
            velocity_up = 8;
        }
        else {
            velocity_up = 0;
        }
    }
    
    if (map.ArrowRight && !(collisions.touching_left)) {
        velocity_right += 2;
    }
    
    if (map.ArrowLeft && !(collisions.touching_right)) {
        velocity_right -= 2;
    }

    velocity_right *= 0.75;
    
    playerRect.setAttribute("y", Math.floor(parseFloat(playerRect.getAttribute("y")) - velocity_up));
    if (Math.abs(velocity_right) >= 0.5) {
        playerRect.setAttribute("x", Math.floor(parseFloat(playerRect.getAttribute("x")) + velocity_right));
    }

    setscrolling(parseFloat(playerRect.getAttribute("x")), my_level.split("\n")[0].split("").length * 40);

    requestAnimationFrame(load);

}

levelInit(my_level);
load();