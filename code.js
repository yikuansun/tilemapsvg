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
.......##.............##..............P.
.@....#.#............>#.#...............
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
            else if (theMatrix[r][c] == ">") {
                enemy = document.createElementNS(svgns, "rect");
                enemy.style.fill = "rgb(100, 20, 0)";
                enemy.setAttribute("width", 30); enemy.setAttribute("height", 50);
                enemy.setAttribute("x", c * 40); enemy.setAttribute("y", r * 40 - (50 - 40));
                enemy.setAttribute("rx", 30 / 2);
                enemy.setAttribute("class", "enemytype1");
                enemy.dataset.direction = "left";
                scrollelems.appendChild(enemy);
            }
            else if (theMatrix[r][c] == "P") {
                goal = document.createElementNS(svgns, "rect");
                goal.style.fill = "rgb(0, 255, 0)";
                goal.setAttribute("width", 50); goal.setAttribute("height", 50);
                goal.setAttribute("x", c * 40 - (50 - 40) / 2); goal.setAttribute("y", r * 40 - (50 - 40) / 2);
                scrollelems.appendChild(goal);
                goalAnime = document.createElementNS(svgns, "animateTransform");
                goalAnime.setAttribute("attributeType", "xml");
                goalAnime.setAttribute("attributeName", "transform");
                goalAnime.setAttribute("type", "rotate");
                goalAnime.setAttribute("from", "0 " + (c * 40 + 20).toString() + " " + (r * 40 + 20).toString());
                goalAnime.setAttribute("to", "360 " + (c * 40 + 20).toString() + " " + (r * 40 + 20).toString());
                goalAnime.setAttribute("dur", "5s");
                goalAnime.setAttribute("additive", "sum");
                goalAnime.setAttribute("repeatCount", "indefinite");
                goal.appendChild(goalAnime);
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

playerTouchingEnemy = false;
function enemyscript() {
    for (enemy of document.getElementsByClassName("enemytype1")) {
        if (enemy.dataset.direction == "left") {
            enemy.setAttribute("x", Math.floor(parseFloat(enemy.getAttribute("x")) - 1));
            focused_x = Math.floor(parseFloat(enemy.getAttribute("x")) / 40);
            focused_y = Math.floor(parseFloat(enemy.getAttribute("y")) / 40) + 1;
            focused_brick_wall = document.getElementById(focused_x.toString() + "::" + focused_y.toString());
            focused_brick_gap = document.getElementById(focused_x.toString() + "::" + (focused_y + 1).toString());
            if (document.body.contains(focused_brick_wall) || !(document.body.contains(focused_brick_gap))) {
                enemy.dataset.direction = "right";
            }
        } else {
            enemy.setAttribute("x", Math.floor(parseFloat(enemy.getAttribute("x")) + 1));
            focused_x = Math.ceil(parseFloat(enemy.getAttribute("x") - (40 - 30)) / 40);
            focused_y = Math.floor(parseFloat(enemy.getAttribute("y")) / 40) + 1;
            focused_brick_wall = document.getElementById(focused_x.toString() + "::" + focused_y.toString());
            focused_brick_gap = document.getElementById(focused_x.toString() + "::" + (focused_y + 1).toString());
            if (document.body.contains(focused_brick_wall) || !(document.body.contains(focused_brick_gap))) {
                enemy.dataset.direction = "left";
            }
        }
        if (touching(enemy, playerRect)) {
            playerTouchingEnemy = true;
        }
    }
}

function bulletscript() {
    speed = 10;
    i = 0;
    while (true) {
        if (i >= document.getElementsByClassName("bullet").length) {
            break;
        }
        bullet = document.getElementsByClassName("bullet")[i];
        bulletx = parseFloat(bullet.getAttribute("x"));
        bullety = parseFloat(bullet.getAttribute("y"));
        bullet.setAttribute("x", Math.floor(bulletx + Math.cos(bullet.dataset.angle) * speed));
        bullet.setAttribute("y", Math.floor(bullety - Math.sin(bullet.dataset.angle) * speed));
        if (bulletx < 0 || bullety < 0 || bulletx > my_level.split("\n")[0].split("").length * 40 || bullety > my_level.split("\n").length * 40) {
            bullet.remove();
            i -= 1;
        }
        else if (document.getElementById(Math.floor(parseFloat(bullet.getAttribute("x")) / 40).toString() + "::" + Math.floor(parseFloat(bullet.getAttribute("y")) / 40).toString())) {
            bullet.remove();
            i -= 1;
        }
        else {
            for (enemy of document.getElementsByClassName("enemytype1")) {
                if (touching(enemy, bullet)) {
                    bullet.remove();
                    enemy.remove();
                    i -= 1;
                }
            }
        }
        i++;
    }
}

function setscrolling(playerxpos, levelwidth) {
    if ((-(playerxpos - 426)) <= 0 && (-(playerxpos - 426)) >= -levelwidth + 852) {
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

cursorpos = [0, 0];
updateCursorPos = function(e) {
    posOffsetData = document.getElementById("gameframe").getBoundingClientRect();
    cursorpos[0] = e.clientX - posOffsetData.x - parseInt(scrollelems.getAttribute("transform").split("translate(")[1]);
    cursorpos[1] = e.clientY - posOffsetData.y;
}
window.addEventListener("mousemove", updateCursorPos);
clicked = false;
document.getElementById("gameframe").addEventListener("click", function(e) {
    updateCursorPos(e);
    clicked = true;
});

frame = 0;

function load() {

    collisions = detect_platform_collisions();

    enemyscript();
    bulletscript();

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

    if (clicked) {
        clicked = false;
        bullet = document.createElementNS(svgns, "rect");
        bullet.setAttribute("width", 10);
        bullet.setAttribute("height", 10);
        bullet.setAttribute("rx", 5);
        bullet.setAttribute("x", parseFloat(playerRect.getAttribute("x")) + 15);
        bullet.setAttribute("y", parseFloat(playerRect.getAttribute("y")) + 25);
        scrollelems.appendChild(bullet);
        fireangle = Math.atan2((parseFloat(bullet.getAttribute("y")) - cursorpos[1]) , (cursorpos[0] - parseFloat(bullet.getAttribute("x"))));
        bullet.dataset.angle = fireangle;
        bullet.setAttribute("class", "bullet");
        velocity_right -= 2 * Math.cos(fireangle);
        velocity_up -= 2 * Math.sin(fireangle);
    }
    
    playerRect.setAttribute("y", Math.floor(parseFloat(playerRect.getAttribute("y")) - velocity_up));
    if (Math.abs(velocity_right) >= 0.5) {
        playerRect.setAttribute("x", Math.floor(parseFloat(playerRect.getAttribute("x")) + velocity_right));
    }

    setscrolling(parseFloat(playerRect.getAttribute("x")), my_level.split("\n")[0].split("").length * 40);

    if (parseFloat(playerRect.getAttribute("y")) > 480 || playerTouchingEnemy) {
        alert("loser");
    }
    else if (frame % 21 == 0) {
        if (touching(playerRect, goal)) {
            alert("winner");
        }
        else {
            requestAnimationFrame(load);
        }
    }
    else {
        requestAnimationFrame(load);
    }

    frame++;

}

levelInit(my_level);
load();