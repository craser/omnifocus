/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var threeSum = function (nums) {
    nums = nums.sort((a, b) => (a - b)); // hack hack
    const combos = [];
    const indexes = [];
    const skip = {};
    // TODO: skip repetitions of nums[i]
    for (let i = 0; i < nums.length;) {
        const num = nums[i];
        let left = i + 1;
        let right = nums.length - 1;
        while (left < right) {
            const l = nums[left];
            const r = nums[right];
            const sum = (num + nums[left] + nums[right]);
            
            if (sum < 0) {
                left++;
            } else if (sum > 0) {
                right--;
            } else {
                console.log(`push ${[num, l, r]}`);
                combos.push([num, l, r]);
                indexes.push([i, left, right]);
                while (nums[++left] === l) ;
                while (nums[--right] === r) ;
            }
        }
        
        
        while (nums[++i] === num) ;
    }
    return { combos, indexes };
}

test('example', () => {
    const input = [2, -3, 0, -2, -5, -5, -4, 1, 2, -2, 2, 0, 2, -4, 5, 5, -10];
    const { combos, indexes } = threeSum(input);
    console.log(`combos : ${JSON.stringify(combos)}`);
    console.log(`indexes: ${JSON.stringify(indexes)}`);
    const expected = [[-10, 5, 5], [-5, 0, 5], [-4, 2, 2], [-3, -2, 5], [-3, 1, 2], [-2, 0, 2]];
    expect(JSON.stringify(combos)).toEqual(JSON.stringify(expected));
});
